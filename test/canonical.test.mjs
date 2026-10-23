import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { CanonicalStore } from '../src/core/canonical-store.mjs';
import { FIELDS } from '../src/core/schema.mjs';

test('SQLite bridge preserves user layers, detects external revisions and binds evidence to source hash', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'canonical-paper-'));
  try {
    const s = await new CanonicalStore(path.join(dir,'cache'), {libraryDir:path.join(dir,'library'),script:fileURLToPath(new URL('../lib/literature.py',import.meta.url))}).init();
    // A deterministic text PDF, independent of the user's papers.
    const content='BT /F1 12 Tf 30 700 Td (Financial question answering on annual reports and research evidence.) Tj ET';
    const pdf=Buffer.from(`%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj\ntrailer << /Root 1 0 R >>\n%%EOF`);
    const imported=await s.importPdf(pdf,'sample.pdf'), id=imported.paper.id;
    const draft={title:'Sample',fields:Object.fromEntries(FIELDS.map(([k])=>[k,{value_zh:'财报问答研究',value_en:'Financial QA research',evidence:[{pdf_page:1,quote:'Financial question answering'}]}]))};
    await s.saveExtraction(id,draft,{source:'harness_model',provider:'mock',model:'mock'});
    let p=s.get(id); assert.equal(p.revision,2); assert.equal(p.analysis.source,'harness_model');
    await s.update(id,p.revision,{field:'results',value_zh:'用户保留的修订',value_en:'Human correction'});
    p=s.get(id); await s.update(id,p.revision,{review_field:'results',verified:true});
    await s.saveExtraction(id,{...draft,fields:{...draft.fields,results:{...draft.fields.results,value_zh:'更新的机器草稿'}}},{source:'harness_model'});
    p=s.get(id); assert.equal(p.overrides.results.value_zh,'用户保留的修订'); assert.equal(p.review.results.status,'verified'); assert.equal(p.reading_status,'not_recorded');
    const before=p.revision;
    await s.cli('status',['--id',p.canonical_id,'--expected-revision',String(before),'--value','reading']);
    await assert.rejects(s.update(id,before,{notes:'should not write'}),/其他窗口/);
    await s.sync(); assert.equal(s.get(id).reading_status,'reading');
    const exported=await s.canonicalExport('json'); const records=JSON.parse(exported.text).papers;
    assert.equal(records[0].fields.findings.human.value.en,'Human correction');
    assert.equal(records[0].fields.findings.generated.value.zh,'更新的机器草稿');
    assert.ok(records[0].coverage.pages_read.includes(1));
    assert.ok(s.records.get(id).sources[0].startsWith(await realpath(path.join(dir,'library','pdf-assets')) + path.sep));
    // Removing the parser cache must not delete browser-uploaded originals.
    const rebuilt=await new CanonicalStore(path.join(dir,'rebuilt-cache'),{libraryDir:path.join(dir,'library'),script:s.script}).init();
    assert.ok(rebuilt.get(id).pages[0].includes('Financial question answering'));
    assert.equal(rebuilt.get(id).overrides.results.value_zh,'用户保留的修订');
    await s.verifySource(id);
    await writeFile(s.records.get(id).sources[0],'changed');
    await assert.rejects(s.verifySource(id),/哈希/);
    const reopened=await new CanonicalStore(path.join(dir,'cache'),{libraryDir:path.join(dir,'library'),script:s.script}).init();
    assert.equal(reopened.get(id).overrides.results.value_zh,'用户保留的修订');
  } finally { await rm(dir,{recursive:true,force:true}); }
});
