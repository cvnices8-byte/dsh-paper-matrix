import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import path from 'node:path';
import { PaperStore } from './store.mjs';
import { parsePdf } from './pdf.mjs';
import { FIELDS, validateExtraction, checkEvidence, paperSummary, csvExport } from './schema.mjs';
const execute = promisify(execFile);
const MAP = { type: 'research_type', problem: 'research_question', data: 'data', construction: 'construction', evidence: 'benchmark_evidence', evaluation_sample: 'evaluation_sample', settings: 'settings', metrics: 'metrics', results: 'findings', limits: 'author_limitations', resources: 'resources' };
const TO_READING = { not_recorded: 'unrecorded', unread: 'to_read', reading: 'reading', read: 'read', archived: 'archived' };
const FROM_READING = Object.fromEntries(Object.entries(TO_READING).map(([a,b]) => [b,a]));
const bilingualValue = value => typeof value === 'object' && value && !Array.isArray(value) && ('zh' in value || 'en' in value) ? { value_zh: String(value.zh ?? ''), value_en: String(value.en ?? '') } : { value_zh: typeof value === 'string' ? value : JSON.stringify(value ?? ''), value_en: '' };

/** SQLite remains the source of truth. JSON here is only a disposable parsed-text/job cache. */
export class CanonicalStore extends PaperStore {
  constructor(dir, { libraryDir, script, python = 'python3' }) { super(dir); this.libraryDir = path.resolve(libraryDir); this.script = script; this.python = python; this.records = new Map(); }
  async cli(command, args = []) {
    let stdout;
    try { ({ stdout } = await execute(this.python, [this.script, '--library', this.libraryDir, command, ...args], { maxBuffer: 32 * 1024 * 1024, timeout: 30000, windowsHide: true })); }
    catch (e) { let info; try { info = JSON.parse(e.stdout); } catch {} throw new Error(info?.error ?? `文献库命令失败：${e.code ?? 'unknown'}。请检查 Python 与库目录。`); }
    const result = JSON.parse(stdout);
    if (!result.ok) throw new Error(String(result.error ?? '文献库操作失败'));
    return result;
  }
  async input(command, record, input, extra = []) {
    const file = path.join(this.dir, `${randomUUID()}.json`);
    await writeFile(file, JSON.stringify(input), { mode: 0o600 });
    try { return await this.cli(command, ['--id', record.paper_id, '--expected-revision', String(record.revision), '--input', file, ...extra]); }
    finally { await rm(file, { force: true }); }
  }
  async init() { await super.init(); await this.cli('init'); await this.sync(); return this; }
  async sync() {
    return this.mutate(async state => {
      const snapshot = path.join(this.dir, 'canonical-snapshot.json');
      await this.cli('export', ['--format', 'json', '--output', snapshot]);
      const { papers } = JSON.parse(await readFile(snapshot, 'utf8'));
      const next = [], records = new Map();
      for (const r of papers) {
        let cached = state.papers.find(p => p.sha256 === r.sha256);
        let sourceError = '';
        if (!cached) {
          for (const source of r.sources) {
            try {
              const bytes = await readFile(source), parsed = await parsePdf(bytes, path.basename(source));
              if (parsed.sha256 !== r.sha256) continue;
              await writeFile(path.join(this.dir, 'pdfs', parsed.id + '.pdf'), bytes, {mode:0o600});
              cached = { ...parsed, analysis: {status:'not_started'}, history: [] }; break;
            } catch (e) { sourceError = e.message; }
          }
          if (!cached) cached = { id: r.sha256.slice(0,24), sha256:r.sha256, filename:path.basename(r.sources[0] ?? ''), pages:[], page_count:r.metadata.page_count ?? 0, text_quality:'ocr_required', analysis:{status:'not_started'}, history:[] };
        }
        const fields = {}, overrides = {}, review = {};
        for (const [key] of FIELDS) {
          const slot = r.fields[MAP[key]] ?? (key === 'construction' ? r.fields.method : undefined);
          if (!slot) continue;
          if (slot.generated) {
            const evidence = (slot.generated.evidence ?? []).map(e => checkEvidence(e, cached.pages));
            fields[key] = { ...bilingualValue(slot.generated.value), evidence, origin: slot.generated.origin, content_status:slot.generated.status, status: evidence.length && evidence.every(e => e.verification === 'text_matched') ? 'supported' : 'needs_review' };
          }
          if (slot.human) overrides[key] = { ...bilingualValue(slot.human.value), evidence:(slot.human.evidence ?? []).map(e=>checkEvidence(e,cached.pages)), origin:'manual' };
          review[key] = {status:slot.review};
        }
        const meta = r.metadata, proposed = r.coverage.plugin_generated_metadata ?? {};
        const running = ['running','queued','error','cancelled','interrupted'].includes(cached.analysis.status);
        const source = r.coverage.plugin_source ?? (r.coverage.import_method === 'pilot_migration' ? 'research_pilot' : undefined);
        const analysis = running ? {...cached.analysis,source,issues:r.issues} : { status:Object.keys(fields).length ? 'done':'not_started', source, ...r.coverage.plugin_route, issues:r.issues };
        const p = { ...cached, canonical_id:r.paper_id, canonical_revision:r.revision, revision:r.revision, title:meta.title || proposed.title || cached.filename.replace(/\.pdf$/i,''), title_zh:meta.title_zh ?? proposed.title_zh ?? '', authors:(meta.authors ?? []).join(', ') || proposed.authors || '', year:String(meta.year ?? proposed.year ?? ''), paper_language:meta.paper_language ?? proposed.paper_language ?? 'unknown', data_language:meta.data_language ?? proposed.data_language ?? 'unknown', metadata_proposal:proposed, fields, overrides, review, reading_status:FROM_READING[r.reading_status] ?? 'not_recorded', notes:r.notes.map(n=>n.text).join('\n\n'), source_paths:r.sources, source_error:cached.pages.length ? '' : sourceError || '原始 PDF 不可用或文件哈希已变化，请重新登记原件。', created_at:r.created_at, analysis };
        records.set(p.id,r); next.push(p);
      }
      state.papers = next; this.records = records;
    });
  }
  async verifySource(id) {
    const r = this.records.get(id);
    if (!r) throw new Error('文献不存在。');
    for (const source of r.sources) { try { const bytes = await readFile(source); if (createHash('sha256').update(bytes).digest('hex') === r.sha256) return; } catch {} }
    throw new Error('原始 PDF 不可用或哈希已变化；停止分析，避免把旧页码用于新版本。');
  }
  async importPdf(bytes, filename) {
    const imported = await super.importPdf(bytes, filename), p = this.get(imported.paper.id);
    // Uploaded files are durable library assets, not disposable parser cache.
    const assets = path.join(this.libraryDir,'pdf-assets');
    await mkdir(assets,{recursive:true,mode:0o700});
    const source = path.join(assets,p.id+'.pdf');
    await writeFile(source,bytes,{mode:0o600});
    const file = path.join(this.dir,randomUUID()+'.json');
    await writeFile(file, JSON.stringify({title:p.title,page_count:p.page_count,metadata_source:'PDF embedded title or filename; not human verified'}),{mode:0o600});
    let added;
    try { added = await this.cli('add',['--pdf',source,'--metadata',file]); }
    finally { await rm(file,{force:true}); }
    await this.sync();
    return {paper:paperSummary(this.get(p.id)),duplicate:added.duplicate};
  }
  async update(id, expectedRevision, changes) {
    const record = (await this.cli('show',['--id',this.get(id).canonical_id])).paper;
    if (record.revision !== expectedRevision) throw new Error('记录已被其他窗口更新，请刷新后重新编辑。');
    const base = ['--id',record.paper_id,'--expected-revision',String(record.revision)];
    const operations = ['reading_status','notes','field','review_field'].filter(k=>changes[k]!==undefined);
    if (operations.length !== 1) throw new Error('一次只保存一项修改。');
    if (changes.reading_status !== undefined) {
      if (!TO_READING[changes.reading_status]) throw new Error('无效阅读状态。');
      await this.cli('status',[...base,'--value',TO_READING[changes.reading_status]]);
    } else if (changes.notes !== undefined) {
      if (typeof changes.notes !== 'string' || !changes.notes.trim() || changes.notes.length>20000) throw new Error('请输入不超过 20,000 字的新增笔记。');
      await this.cli('note',[...base,'--text',changes.notes]);
    } else if (changes.field !== undefined) {
      const canonical = MAP[changes.field]; if (!canonical) throw new Error('无效字段。');
      const value = changes.reset === true ? record.fields[canonical]?.generated?.value : {zh:changes.value_zh,en:changes.value_en};
      if (value === undefined || JSON.stringify(value).length>25000) throw new Error('无效编辑内容。');
      await this.input('edit',record,{value,status:'extracted',evidence:changes.reset ? record.fields[canonical].generated.evidence ?? [] : []},['--field',canonical]);
    } else {
      const canonical = MAP[changes.review_field]; if (!canonical) throw new Error('无效字段。');
      await this.cli('review',[...base,'--field',canonical,'--value',changes.verified===true?'verified':'pending','--text','用户通过 Harness 文献表操作']);
    }
    await this.sync(); return paperSummary(this.get(id));
  }
  async analysisState(id, analysis) { return this.mutate(s=>{const p=s.papers.find(p=>p.id===id);if(!p)throw new Error('文献不存在。');p.analysis=analysis;return paperSummary(p);}); }
  async saveExtraction(id, input, provenance = {}) {
    const p = this.get(id), extracted = validateExtraction(input,p.pages);
    const record = (await this.cli('show',['--id',p.canonical_id])).paper;
    const fields = Object.fromEntries(FIELDS.map(([key,label])=>{
      const f=extracted.fields[key], evidence=f.evidence.filter(e=>e.pdf_page>=1&&e.pdf_page<=p.page_count&&e.quote).map(e=>({pdf_page:e.pdf_page,quote:e.quote,locator:e.locator,check:e.verification==='text_matched'?'text_matched':'unverified'}));
      return [MAP[key],{label,value:{zh:f.value_zh,en:f.value_en},origin:'author',status:evidence.length?'extracted':'unavailable',evidence}];
    }));
    await this.input('apply',record,{fields,coverage:{...record.coverage, mode:'full_text',pages_read:p.pages.map((_,i)=>i+1),parser:'pdfjs-dist 6.4.299 (text layer; no visual table verification)',failures:p.pages.map((text,i)=>text.trim().length<20?i+1:null).filter(Boolean),plugin_source:provenance.source ?? 'harness_model',plugin_route:{provider:provenance.provider,model:provenance.model},plugin_generated_metadata:{title:extracted.title,title_zh:extracted.title_zh,authors:extracted.authors,year:extracted.year,paper_language:extracted.paper_language,data_language:extracted.data_language}}});
    // Official metadata is edited independently; the model's proposal stays in coverage.
    await super.analysisState(id,{...provenance,status:'done',completed_at:new Date().toISOString()});
    await this.sync(); return paperSummary(this.get(id));
  }
  async importPilot() { throw new Error('统一库已接管文献记录。既有试读请使用 ai-literature-manager 的 migrate_pilot.py 迁移，避免重复覆盖。'); }
  async canonicalExport(format) {
    if (!['csv','json','md'].includes(format)) throw new Error('无效导出格式。');
    if (format === 'csv') { await this.sync(); return {filename:'文献拆解宽表.csv',mime:'text/csv;charset=utf-8',text:csvExport(this.list())}; }
    const file=path.join(this.dir,`文献总表.${format}`);
    await this.cli('export',['--format',format,'--output',file]);
    return {filename:`文献总表.${format}`,mime:format==='csv'?'text/csv;charset=utf-8':format==='json'?'application/json':'text/markdown;charset=utf-8',text:await readFile(file,'utf8')};
  }
}
