import { writeFile } from 'node:fs/promises';
import path from 'node:path';

// Original synthetic text for import testing. No published paper is redistributed.
const text = [
  'Paper Matrix - Synthetic Import Example',
  'This is a software test document, not a scientific research paper.',
  'Question: Can a local reading matrix retain page-linked evidence?',
  'Method: Import one PDF, view its text, and inspect the original page.',
  'Dataset: One synthetic PDF. No empirical performance is claimed.',
  'Result: This document defines an example only, not a test outcome.',
  'Limitations: No real study, statistical inference, or causal claim.',
  'Language: English text; the reading interface supports Chinese summaries.'
];
const escape = value => value.replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
const stream = `BT /F1 11 Tf 40 745 Td 18 TL ${text.map((line,i)=>`${i?'T* ':''}(${escape(line)}) Tj`).join('\n')} ET`;
const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
let pdf='%PDF-1.4\n', offsets=[];
objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${object}\nendobj\n`;});
const xref=Buffer.byteLength(pdf);
pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
const output=path.resolve(process.argv[2] ?? 'paper-matrix-example.pdf');
await writeFile(output,pdf,{flag:'wx'});
console.log(output);
