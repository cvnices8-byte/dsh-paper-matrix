import { createHash } from 'node:crypto';
import path from 'node:path';
export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export async function parsePdf(bytes, filename) {
  if (!Buffer.isBuffer(bytes) || bytes.length > MAX_PDF_BYTES || bytes.length < 8 || !bytes.subarray(0, 1024).includes(Buffer.from('%PDF-'))) throw new Error('请导入有效 PDF，单篇最大 25 MB。');
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, useSystemFonts: true, verbosity: 0 });
  try {
    const doc = await task.promise;
    if (doc.numPages > 300) throw new Error('首版支持不超过 300 页的 PDF。');
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => item.str ? item.str + (item.hasEOL ? '\n' : ' ') : '').join(''));
      page.cleanup();
    }
    if (pages.join('').length > 3_000_000) throw new Error('PDF 文本量超出首版上限。');
    const info = (await doc.getMetadata().catch(() => ({}))).info ?? {};
    const hash = createHash('sha256').update(bytes).digest('hex');
    const name = path.basename(String(filename)).replace(/[\u0000-\u001f]/gu, '').slice(0, 240);
    return { id: hash.slice(0, 24), sha256: hash, filename: name, title: typeof info.Title === 'string' && info.Title.trim() ? info.Title.trim().slice(0, 500) : name.replace(/\.pdf$/i, ''), pages, page_count: pages.length, text_quality: pages.filter(text => text.trim().length >= 50).length / pages.length < 0.5 ? 'ocr_required' : 'text_available' };
  } catch (error) {
    if (error.name === 'PasswordException') throw new Error('该 PDF 有密码保护，请先解密。');
    throw error;
  } finally { await task.destroy(); }
}
