import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('global installer uses bun for dependencies and npm link for the executable', async () => {
  const script = await readFile('scripts/install-global.sh', 'utf8');
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));

  assert.equal(pkg.scripts['install:global'], './scripts/install-global.sh');
  assert.match(script, /command -v npm/);
  assert.match(script, /bun install --frozen-lockfile/);
  assert.match(script, /npm install --no-package-lock/);
  assert.match(script, /npm link/);
  assert.doesNotMatch(script, /npm install -g/);
});
