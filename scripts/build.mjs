import { build } from 'esbuild';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
await mkdir('lib', { recursive: true });
await copyFile('vendor/literature.py', 'lib/literature.py');
await build({ entryPoints: ['src/host.mjs'], outfile: 'lib/index.js', bundle: true, platform: 'node', format: 'esm', target: 'node22', external: ['pdfjs-dist/*', '@deepseek-ai/*'], sourcemap: false });
const result = await build({ entryPoints: ['src/client.jsx'], bundle: true, platform: 'browser', format: 'cjs', target: 'es2022', external: ['react', 'react/jsx-runtime'], loader: { '.css': 'text' }, write: false });
await writeFile('lib/client.js', `window.__ModuleLoader__.load({id:'dsh-paper-matrix',factory:(require)=>{var module={exports:{}};var exports=module.exports;\n${result.outputFiles[0].text}\nreturn module.exports;}});\n`);
console.log('Built host and native sidebar client.');
