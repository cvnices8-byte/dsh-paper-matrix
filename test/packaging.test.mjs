import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
test('published package includes all prebuilt entries and requires no install-time lifecycle build', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  for (const hook of ['prepare','prepack','prepublish','install','preinstall','postinstall']) {
    assert.equal(pkg.scripts?.[hook], undefined, `Git installs must not require ${hook}`);
  }
  const required = ['lib/index.js','lib/client.js','lib/literature.py','cordis.patch.yml'];
  const packed = spawnSync('npm', ['pack','--dry-run','--ignore-scripts','--json'], { cwd: root, encoding:'utf8' });
  assert.equal(packed.status, 0, packed.stderr);
  const files = new Set(JSON.parse(packed.stdout)[0].files.map(f => f.path));
  for (const file of required) {
    await access(new URL('../'+file,import.meta.url));
    assert.ok(files.has(file), `Missing installable runtime file: ${file}`);
    const ignored = spawnSync('git', ['check-ignore',file], { cwd: root, encoding:'utf8' });
    assert.equal(ignored.status, 1, `${file} must be publishable in Git archives`);
  }
  assert.equal(await readFile(new URL('../lib/literature.py',import.meta.url),'utf8'), await readFile(new URL('../vendor/literature.py',import.meta.url),'utf8'));
});
