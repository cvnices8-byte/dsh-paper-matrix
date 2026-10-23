export const FIELDS = [
  ['type', '文献类型', 'Paper type'], ['problem', '研究问题', 'Research question'],
  ['data', '数据与样本', 'Data & sample'], ['construction', '方法与构建', 'Method & construction'],
  ['evidence', '底层证据设计', 'Evidence design'], ['evaluation_sample', '评测范围', 'Evaluation scope'],
  ['settings', '实验或识别设计', 'Experiment / identification'], ['metrics', '评价指标', 'Metrics'],
  ['results', '核心发现', 'Findings'], ['limits', '局限与边界', 'Limitations'], ['resources', '代码与数据', 'Code & data']
];
export const FIELD_KEYS = new Set(FIELDS.map(([key]) => key));
export const normalizeQuote = text => String(text).normalize('NFKC').replace(/\u00ad/g, '').replace(/\s+/gu, '').replace(/(\p{L})-(?=\p{L})/gu, '$1').trim();
export function checkEvidence(item, pages) {
  const page = Number(item.pdf_page);
  const quote = typeof item.quote === 'string' ? item.quote.trim().slice(0, 4000) : '';
  const normalized = normalizeQuote(quote);
  return { pdf_page: Number.isSafeInteger(page) ? page : 0, quote, locator: String(item.locator ?? '').slice(0, 300), verification: page >= 1 && page <= pages.length && normalized.length >= 8 && normalizeQuote(pages[page - 1]).includes(normalized) ? 'text_matched' : 'unmatched' };
}
export function validateExtraction(input, pages) {
  if (!input || typeof input !== 'object' || !input.fields || typeof input.fields !== 'object' || Array.isArray(input.fields)) throw new Error('模型未返回有效的 fields 对象；原记录已保留。');
  const fields = {};
  for (const [key] of FIELDS) {
    const f = input.fields[key];
    if (!f || typeof f !== 'object' || typeof f.value_zh !== 'string') throw new Error(`缺少字段 ${key} 或 value_zh；请重试。`);
    const evidence = (Array.isArray(f.evidence) ? f.evidence : []).slice(0, 12).map(e => checkEvidence(e ?? {}, pages));
    fields[key] = { value_zh: f.value_zh.slice(0, 12000), value_en: String(f.value_en ?? '').slice(0, 12000), origin: 'model', evidence, status: evidence.length && evidence.every(e => e.verification === 'text_matched') ? 'supported' : 'needs_review' };
  }
  const str = (key, max = 500) => typeof input[key] === 'string' ? input[key].trim().slice(0, max) : '';
  return { title: str('title'), title_zh: str('title_zh'), authors: str('authors'), year: str('year', 30), paper_language: str('paper_language', 50) || 'unknown', data_language: str('data_language', 100) || 'unknown', fields };
}
export function effectiveField(paper, key) {
  return { ...paper.fields?.[key], ...paper.overrides?.[key] };
}
export function paperSummary(p) {
  const { pages, ...rest } = p;
  return rest;
}
export function csvExport(papers) {
  // Prevent formulas from executing when a user opens the CSV in a spreadsheet.
  const cell = v => '"' + String(v ?? '').replace(/^[=+\-@\t\r]/u, s => "'" + s).replaceAll('"', '""') + '"';
  const rows = [['ID', 'SHA256', 'PDF路径', '原文标题', '中文标题（译）', '作者', '年份', '论文语言', '数据语言', '阅读状态', ...FIELDS.map(f => f[1]), ...FIELDS.map(f => f[2]), '页码与引用 JSON']];
  for (const p of papers) rows.push([p.canonical_id || p.id, p.sha256, (p.source_paths ?? []).join('\n'), p.title, p.title_zh, p.authors, p.year, p.paper_language, p.data_language, p.reading_status, ...FIELDS.map(([key]) => effectiveField(p, key).value_zh), ...FIELDS.map(([key]) => effectiveField(p, key).value_en), JSON.stringify(Object.fromEntries(FIELDS.map(([key]) => [key, { ...p.fields[key], override: p.overrides[key], reviewed: p.review[key] }])))]);
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
