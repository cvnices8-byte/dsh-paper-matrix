import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PaperStore } from '../src/core/store.mjs';
import { FIELDS, checkEvidence, validateExtraction, csvExport } from '../src/core/schema.mjs';
import { extractionPrompt, runExtraction } from '../src/core/analysis.mjs';
const draft = () => ({ title: 'CFQA', fields: Object.fromEntries(FIELDS.map(([k]) => [k, { value_zh: '中文摘要', value_en: 'English summary', evidence: [{ pdf_page: 1, quote: 'Financial question answering' }] }])) });
const record = (id = 'test') => ({ id, sha256: id, pages: ['Financial question answering on annual reports.'], page_count: 1, title: 'Sample', fields: {}, overrides: {}, review: {}, history: [], notes: '', revision: 1, reading_status: 'not_recorded', text_quality: 'text_available', analysis: {status:'not_started'} });
const mockLlm = stream => ({ async prepareCall(config, signal, configure) { return { config: configure(config, { reasoning: { efforts: [{id:'low'},{id:'high'}] } }), stream }; } });
test('quote checks handle bilingual spacing and ligatures but reject wrong pages and invented evidence', () => {
  assert.equal(checkEvidence({ pdf_page: 1, quote: '财务报告 Financial ofﬁce' }, ['财 务 报 告 Financial office']).verification, 'text_matched');
  assert.equal(checkEvidence({ pdf_page: 1, quote: 'Annual Report question answering' }, ['Annual Re-\nport ques-\ntion answering']).verification, 'text_matched');
  assert.equal(checkEvidence({ pdf_page: 1, quote: 'change of 10-6 percent' }, ['change of 106 percent']).verification, 'unmatched');
  assert.equal(checkEvidence({ pdf_page: 2, quote: 'Financial question answering' }, ['Financial question answering']).verification, 'unmatched');
  assert.equal(checkEvidence({ pdf_page: 1, quote: 'made up quotation' }, ['Financial question answering']).verification, 'unmatched');
  assert.equal(checkEvidence({ pdf_page: 1, quote: '' }, ['']).verification, 'unmatched');
  const noEvidence = draft(); noEvidence.fields.results.evidence = [];
  assert.equal(validateExtraction(noEvidence, record().pages).fields.results.status, 'needs_review');
});
test('persistent edits and reading state survive reanalysis; stale editors cannot overwrite newer state', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'paper-matrix-'));
  try {
    const s = await new PaperStore(dir).init();
    await s.mutate(state => state.papers.push(record()));
    await s.saveExtraction('test', draft());
    await s.update('test', 2, { field: 'results', value_zh: '我的修正', value_en: 'My correction' });
    await s.update('test', 3, { reading_status: 'reading', review_field: 'results', verified: true });
    await assert.rejects(s.update('test', 3, {notes:'stale'}), /其他窗口/);
    await s.saveExtraction('test', draft());
    const reopened = await new PaperStore(dir).init();
    assert.equal(reopened.get('test').overrides.results.value_zh, '我的修正');
    assert.equal(reopened.get('test').reading_status, 'reading');
    assert.deepEqual(reopened.get('test').review, {});
    assert.equal(reopened.get('test').history.length, 2);
    assert.equal(reopened.get('test').notes, '');
  } finally { await rm(dir, { recursive:true, force:true }); }
});
test('simultaneous independent writes serialize without losing notes or reading state', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'paper-matrix-'));
  try { const s = await new PaperStore(dir).init(); await s.mutate(state => state.papers.push(record()));
    const results = await Promise.allSettled([s.update('test',1,{notes:'one'}),s.update('test',1,{reading_status:'read'})]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length,1);
    assert.equal(JSON.parse(await readFile(path.join(dir,'library.json'))).papers[0].notes,'one');
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('failed or truncated model output never becomes a valid extraction', async () => {
  const llm = mockLlm(async function*() { yield {type:'text-delta',text:JSON.stringify(draft())}; yield {type:'finish',reason:{kind:'length'}}; });
  await assert.rejects(runExtraction(llm, record(), {provider:'mock',model:'mock'}, new AbortController().signal,true), /未完成/);
  const incomplete = mockLlm(async function*() { yield {type:'text-delta',text:JSON.stringify(draft())}; });
  await assert.rejects(runExtraction(incomplete, record(), {},new AbortController().signal,true), /中断/);
  const good = mockLlm(async function*(options) { assert.equal(options.reasoningEffort,'low'); yield {type:'text-delta',text:'```json\n'+JSON.stringify(draft())+'\n```'}; yield {type:'finish',reason:{kind:'stop'}}; });
  assert.equal((await runExtraction(good,record(),{},new AbortController().signal,true)).title,'CFQA');
  assert.throws(() => extractionPrompt({...record(),pages:['x'.repeat(180001)]}), /不静默截断/);
  assert.throws(() => extractionPrompt({...record(),text_quality:'ocr_required'}), /OCR/);
});
test('CSV includes bilingual manual edits and neutralizes spreadsheet formulas', () => {
  const p = {...record(),title:'=HYPERLINK("bad")',fields:validateExtraction(draft(),record().pages).fields,overrides:{results:{value_zh:'手工结果',value_en:'Manual result'}}};
  const csv = csvExport([p]); assert.ok(csv.startsWith('\uFEFF')); assert.ok(csv.includes("'=HYPERLINK")); assert.ok(csv.includes('Manual result')); assert.ok(csv.includes('pdf_page'));
});
