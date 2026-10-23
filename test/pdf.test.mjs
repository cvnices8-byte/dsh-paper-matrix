import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { PaperStore } from '../src/core/store.mjs';
import { parsePdf } from '../src/core/pdf.mjs';
function tinyPdf(text) {
  const stream = `BT /F1 12 Tf 30 700 Td (${text}) Tj ET`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf = '%PDF-1.4\n', offsets = [0];
  for (let i=0;i<objects.length;i++) { offsets.push(Buffer.byteLength(pdf)); pdf += `${i+1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(pdf); pdf += `xref\n0 6\n0000000000 65535 f \n` + offsets.slice(1).map(o => String(o).padStart(10,'0')+' 00000 n \n').join('') + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}
test('real PDF extraction retains physical pages and content hash dedup does not merge two CFQAs', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'paper-pdf-'));
  try {
    const s = await new PaperStore(dir).init();
    const a = tinyPdf('CFQA research sample A Financial question answering on annual reports.');
    const b = tinyPdf('CFQA research sample B Chinese report reading and evidence benchmark.');
    const first = await s.importPdf(a,'CFQA.pdf');
    assert.equal(first.paper.page_count,1);
    assert.equal(first.paper.reading_status,'not_recorded');
    assert.ok(s.get(first.paper.id).pages[0].includes('Financial question answering'));
    assert.equal((await s.importPdf(a,'renamed.pdf')).duplicate,true);
    const second = await s.importPdf(b,'CFQA.pdf');
    assert.notEqual(first.paper.id,second.paper.id);
    assert.equal(s.list().length,2);
    assert.equal((await s.pdfBytes(first.paper.id)).compare(a),0);
    await assert.rejects(parsePdf(Buffer.from('not a PDF'),'bad.pdf'), /有效 PDF/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
