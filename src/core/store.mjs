import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parsePdf } from './pdf.mjs';
import { FIELDS, FIELD_KEYS, validateExtraction, paperSummary, checkEvidence } from './schema.mjs';
const clone = value => structuredClone(value);
export class PaperStore {
  constructor(dir) { this.dir = path.resolve(dir); this.state = { version: 1, papers: [] }; this.queue = Promise.resolve(); }
  async init() {
    await mkdir(path.join(this.dir, 'pdfs'), { recursive: true, mode: 0o700 });
    try { this.state = JSON.parse(await readFile(path.join(this.dir, 'library.json'), 'utf8')); }
    catch (e) { if (e.code !== 'ENOENT') throw new Error('文献库无法读取；为保护已有记录，已停止写入。'); }
    if (this.state.version !== 1 || !Array.isArray(this.state.papers)) throw new Error('不支持的文献库格式。');
    for (const p of this.state.papers) if (['running', 'queued'].includes(p.analysis?.status)) p.analysis = { ...p.analysis, status: 'interrupted', error: '上次分析因宿主退出中断，请重新分析。' };
    for (const p of this.state.papers) {
      const before = JSON.stringify(p.fields);
      for (const f of Object.values(p.fields)) {
        f.evidence = (f.evidence ?? []).map(e => checkEvidence(e, p.pages));
        f.status = f.evidence.length && f.evidence.every(e => e.verification === 'text_matched') ? 'supported' : 'needs_review';
      }
      if (before !== JSON.stringify(p.fields)) p.revision++;
    }
    return this;
  }
  async mutate(fn) {
    const run = this.queue.then(async () => {
      const draft = clone(this.state);
      const result = await fn(draft);
      const temp = path.join(this.dir, `library.${randomUUID()}.tmp`);
      await writeFile(temp, JSON.stringify(draft, null, 2), { mode: 0o600 });
      await rename(temp, path.join(this.dir, 'library.json'));
      this.state = draft;
      return clone(result);
    });
    this.queue = run.catch(() => {});
    return run;
  }
  list() { return clone(this.state.papers.map(paperSummary)); }
  get(id) {
    const p = this.state.papers.find(p => p.id === id);
    if (!p) throw new Error('文献不存在。');
    return clone(p);
  }
  async importPdf(bytes, filename) {
    const parsed = await parsePdf(bytes, filename);
    return this.mutate(async state => {
      const existing = state.papers.find(p => p.sha256 === parsed.sha256);
      if (existing) return { paper: paperSummary(existing), duplicate: true };
      await writeFile(path.join(this.dir, 'pdfs', parsed.id + '.pdf'), bytes, { mode: 0o600 });
      const p = { ...parsed, title_zh: '', authors: '', year: '', paper_language: 'unknown', data_language: 'unknown', fields: {}, overrides: {}, review: {}, reading_status: 'not_recorded', notes: '', revision: 1, created_at: new Date().toISOString(), analysis: { status: 'not_started' }, history: [] };
      state.papers.push(p);
      return { paper: paperSummary(p), duplicate: false };
    });
  }
  async update(id, expectedRevision, changes) {
    return this.mutate(state => {
      const p = state.papers.find(p => p.id === id);
      if (!p) throw new Error('文献不存在。');
      if (p.revision !== expectedRevision) throw new Error('记录已被其他窗口更新，请刷新后重新编辑。');
      if (changes.reading_status !== undefined) {
        if (!['not_recorded', 'unread', 'reading', 'read'].includes(changes.reading_status)) throw new Error('无效阅读状态。');
        p.reading_status = changes.reading_status;
      }
      if (changes.notes !== undefined) { if (typeof changes.notes !== 'string' || changes.notes.length > 20000) throw new Error('笔记过长。'); p.notes = changes.notes; }
      if (changes.field !== undefined) {
        if (!FIELD_KEYS.has(changes.field)) throw new Error('无效字段。');
        if (changes.reset === true) delete p.overrides[changes.field];
        else {
          if (typeof changes.value_zh !== 'string' || typeof changes.value_en !== 'string' || changes.value_zh.length > 12000 || changes.value_en.length > 12000) throw new Error('无效编辑内容。');
          p.overrides[changes.field] = { value_zh: changes.value_zh, value_en: changes.value_en, origin: 'manual', updated_at: new Date().toISOString() };
        }
        delete p.review[changes.field];
      }
      if (changes.review_field !== undefined) {
        if (!FIELD_KEYS.has(changes.review_field) || !p.fields[changes.review_field]) throw new Error('该字段尚无拆解结果。');
        p.review[changes.review_field] = { status: changes.verified === true ? 'verified' : 'pending', at: new Date().toISOString() };
      }
      p.revision++; return paperSummary(p);
    });
  }
  async analysisState(id, analysis) { return this.mutate(s => { const p = s.papers.find(p => p.id === id); if (!p) throw new Error('文献不存在。'); p.analysis = analysis; p.revision++; return paperSummary(p); }); }
  async saveExtraction(id, input, provenance = {}) {
    const extracted = validateExtraction(input, this.get(id).pages);
    return this.mutate(s => {
      const p = s.papers.find(p => p.id === id);
      p.history.push({ at: new Date().toISOString(), fields: p.fields, analysis: p.analysis });
      p.history = p.history.slice(-5);
      Object.assign(p, extracted);
      p.review = {}; // Evidence changed; old verification cannot certify a new extraction.
      p.analysis = { ...provenance, status: 'done', completed_at: new Date().toISOString() };
      p.revision++; return paperSummary(p);
    });
  }
  async importPilot(input) {
    if (input?.schema_version !== 'pilot-reading-v0.1' || !Array.isArray(input.papers)) throw new Error('请使用本项目调研样本 JSON；普通备份通过导出保留。');
    let imported = 0, skipped = 0;
    for (const sample of input.papers) {
      const p = this.state.papers.find(p => p.sha256 === sample.sha256);
      if (!p || Object.keys(p.fields).length || ['running', 'queued'].includes(p.analysis.status)) { skipped++; continue; }
      const converted = { title: sample.title, title_zh: sample.language?.translated_title_zh ?? '', year: String(sample.year_as_printed ?? ''), paper_language: sample.language?.paper_main_text ?? 'unknown', data_language: sample.language?.benchmark_data_language ?? 'unknown', fields: Object.fromEntries(FIELDS.map(([key]) => [key, { value_zh: sample.fields[key]?.value ?? '原文未提及', value_en: '', evidence: sample.fields[key]?.evidence ?? [] }])) };
      await this.saveExtraction(p.id, converted, { source: 'research_pilot', note: '人工辅助调研试读，非插件模型测试结果', issues: sample.issues ?? [] });
      // Recheck every quote against this import's extracted text, never trust the pilot label.
      imported++;
    }
    return { imported, skipped };
  }
  async pdfBytes(id) { this.get(id); return readFile(path.join(this.dir, 'pdfs', id + '.pdf')); }
}
