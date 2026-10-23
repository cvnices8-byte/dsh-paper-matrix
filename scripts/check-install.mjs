// Real installs with a fresh store and no allowed build scripts. Uses only an
// isolated temporary consumer, never an existing Harness profile or paper library.
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const work=await mkdtemp(path.join(os.tmpdir(),'paper-matrix-install-'));
const pnpm=process.env.PNPM_BIN || 'pnpm';
function run(exe,args,cwd) {
  const p=spawnSync(exe,args,{cwd,encoding:'utf8',env:{...process.env,CI:'true'},maxBuffer:8*1024*1024});
  if(p.status!==0)throw new Error(`${exe} ${args.join(' ')}\n${p.stdout}\n${p.stderr}`);
  return p.stdout;
}
try {
  const pack=JSON.parse(run('npm',['pack','--ignore-scripts','--json','--pack-destination',work],root))[0];
  const archive=path.join(work,pack.filename);
  const repo=path.join(work,'package');run('tar',['-xzf',archive,'-C',work],root);
  // Both Git and tarball consumers must get a runnable main, client and Python
  // bridge. A local Git remote exercises pnpm's actual Git prepare decision.
  run('git',['init','-q'],repo);run('git',['add','.'],repo);
  run('git',['-c','user.name=Install regression','-c','user.email=install-test@example.invalid','commit','-qm','Packaged runtime'],repo);
  const sha=run('git',['rev-parse','HEAD'],repo).trim();
  for(const [kind,spec] of [['git',`git+${new URL('file://'+repo).href}#${sha}`],['tarball',archive]]) {
    const dir=path.join(work,kind);await mkdir(dir);
    await writeFile(path.join(dir,'package.json'),JSON.stringify({private:true,type:'module'}));
    await writeFile(path.join(dir,'pnpm-workspace.yaml'),'packages:\n  - .\nnodeLinker: hoisted\nautoInstallPeers: false\nallowBuilds: {}\n');
    const args=['add',spec,'--store-dir',path.join(work,kind+'-store'),'--reporter=append-only'];
    console.log(run(pnpm.endsWith('.mjs')||pnpm.endsWith('.cjs')?process.execPath:pnpm,pnpm.endsWith('.mjs')||pnpm.endsWith('.cjs')?[pnpm,...args]:args,dir));
    run(process.execPath,['--input-type=module','-e',`import {name,apply} from 'dsh-paper-matrix'; if(name!=='dsh-paper-matrix'||typeof apply!=='function') throw new Error('Host entry failed');`],dir);
    const installed=path.join(dir,'node_modules/dsh-paper-matrix');
    const pkg=JSON.parse(await readFile(path.join(installed,'package.json'),'utf8'));
    if(pkg.version!=='0.1.1')throw new Error('Unexpected installed version');
    if(!(await readFile(path.join(installed,'lib/client.js'),'utf8')).includes('window.__ModuleLoader__.load'))throw new Error('Missing native client entry');
    run(process.env.DSH_PAPER_MATRIX_PYTHON||'python3',[path.join(installed,'lib/literature.py'),'--help'],dir);
    console.log(`PASS: ${kind} installation; host import, client entry, Python bridge; no allowlist changes.`);
  }
} finally { await rm(work,{recursive:true,force:true}); }
