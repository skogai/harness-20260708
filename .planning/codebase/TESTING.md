# Testing Patterns

**Analysis Date:** 2026-07-08

## Test Framework

**Runner:**
- Node built-in test runner via `node --test`.
- Version source: Node runtime `>=18.0.0` in `package.json`.
- Config: No separate test config file detected; scripts live in `package.json`.

**Assertion Library:**
- `node:assert/strict`, imported as `assert` in `test/manifest-sync.test.js`, `test/install-regression.test.js`, `test/security-hardening.test.js`, `test/skill-quality.test.js`, `test/template-settings.test.js`, and `test/install-global-script.test.js`.

**Run Commands:**
```bash
npm test                 # Run all tests via package.json: node --test
bun test                 # Run all tests with Bun's package script compatibility
bun run test:security    # Run focused security-related tests via node --test test/*.test.js
bun run lint             # Run ESLint across src/, test/, bin/, and template utilities
```

## Test File Organization

**Location:**
- Tests live in `test/` at repository root.
- Tests are grouped by behavior area rather than mirroring every source file one-to-one: `test/manifest-sync.test.js` covers `src/manifest.js`, `src/mcps.js`, `src/utils/managed-block.js`, `src/commands/sync.js`, and `src/commands/status.js`; `test/install-regression.test.js` covers install and copy behavior across `src/utils/copy.js`, `src/utils/toon.js`, `src/agents.js`, and `bin/cli.js`.

**Naming:**
- Use descriptive kebab-case names ending in `.test.js`: `manifest-sync.test.js`, `security-hardening.test.js`, `install-regression.test.js`, `template-settings.test.js`, `skill-quality.test.js`, `install-global-script.test.js`.
- Test names are sentence-style behavior descriptions: `manifest validation rejects bad shapes` in `test/manifest-sync.test.js`, `copyCommands rejects traversal before creating command output` in `test/install-regression.test.js`, `sanitizeForLog strips control and DEL characters` in `test/security-hardening.test.js`.

**Structure:**
```
test/
├── install-global-script.test.js   # install script/package script assertions
├── install-regression.test.js      # installer, copy utilities, CLI regression tests
├── manifest-sync.test.js           # manifest, MCP, sync, status behavior
├── security-hardening.test.js      # path/name/log safety tests
├── skill-quality.test.js           # template skill quality and generated Codex output
└── template-settings.test.js       # shared template settings safety
```

## Test Structure

**Suite Organization:**
```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runSync } from '../src/commands/sync.js';

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'harness-manifest-test-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test('sync writes skills and MCP config for all targets and is idempotent', async (t) => {
  const dir = await withTempDir(t);
  // arrange fixture files, act with source helper, assert filesystem output
});
```

**Patterns:**
- Import `test` from `node:test` and define top-level `test()` calls; no `describe()` nesting is used in current tests.
- Keep shared helpers local to each test file unless they need production use. Examples: `withTempDir()` in `test/manifest-sync.test.js`, `test/install-regression.test.js`, and `test/skill-quality.test.js`; `walk()` and `splitFrontmatter()` in `test/skill-quality.test.js`.
- Use arrange/act/assert inline in each `test()` block. Filesystem tests create temp directories, invoke production helpers, then assert exact paths and content.
- Use `t.after()` for cleanup of temporary directories, as in `test/manifest-sync.test.js`, `test/install-regression.test.js`, and `test/skill-quality.test.js`.
- Use strict assertions: `assert.equal()`, `assert.deepEqual()`, `assert.ok()`, `assert.match()`, `assert.doesNotMatch()`, `assert.throws()`, and `assert.rejects()`.

## Mocking

**Framework:** Not used

**Patterns:**
```typescript
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('CLI explicit init subcommand respects non-interactive options', async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve('bin/cli.js');

  await execFileAsync(process.execPath, [
    cliPath,
    'init',
    dir,
    '--yes',
    '--profile',
    'minimal',
  ]);

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'toon-formatter', 'skill.md')), true);
});
```

**What to Mock:**
- Do not mock production modules in current patterns. Prefer real filesystem operations in temp directories for copy, sync, manifest, and CLI behavior.
- Use generated temp fixtures instead of mocks for `skogai.json`, `.mcp.json`, `AGENTS.md`, `.claude/`, `.codex/`, and `.env.example` behavior. See `test/manifest-sync.test.js` and `test/install-regression.test.js`.

**What NOT to Mock:**
- Do not mock `src/utils/copy.js`, `src/commands/sync.js`, or `src/commands/status.js` when testing integration behavior; current tests assert real output paths and content.
- Do not mock the CLI for regression coverage; spawn `bin/cli.js` with `process.execPath` as in `test/install-regression.test.js`.
- Do not mock template files for skill/template quality checks; read committed files under `templates/.claude/skills` and `templates/.claude/settings.json` as in `test/skill-quality.test.js` and `test/template-settings.test.js`.

## Fixtures and Factories

**Test Data:**
```typescript
async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'harness-test-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

const GITHUB_MCP = getCatalogMcp('github');
```

**Location:**
- Temporary fixtures are created inside individual tests with `mkdtemp(join(tmpdir(), '<prefix>'))`: `test/manifest-sync.test.js`, `test/install-regression.test.js`, and `test/skill-quality.test.js`.
- Committed template fixtures live under `templates/.claude/`, `templates/codex/`, and `templates/blocks/`; tests read them directly in `test/skill-quality.test.js`, `test/template-settings.test.js`, and `test/install-global-script.test.js`.
- Catalog-derived fixtures should use production factories such as `getCatalogMcp('github')` from `src/mcps.js`, as in `test/manifest-sync.test.js`.

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
node --test --experimental-test-coverage   # Optional local coverage with Node's built-in coverage reporter
```
- No coverage script exists in `package.json`.
- No coverage thresholds or coverage config files are detected.

## Test Types

**Unit Tests:**
- Validate pure and near-pure helpers directly with synchronous assertions. Examples: manifest validation in `test/manifest-sync.test.js`, MCP validation/rendering in `test/manifest-sync.test.js`, security validators in `test/security-hardening.test.js`, agent target parsing in `test/install-regression.test.js`.
- Use `assert.throws()` for synchronous validation errors: `validateManifest()`, `validateMcpEntry()`, and `parseAgentTargets()` in `test/manifest-sync.test.js` and `test/install-regression.test.js`.

**Integration Tests:**
- Filesystem integration tests are central. Use temp directories to exercise copy/sync/status flows and assert written files: `test/manifest-sync.test.js` and `test/install-regression.test.js`.
- CLI integration tests spawn `bin/cli.js` with `process.execPath` and non-interactive flags: `test/install-regression.test.js`.
- Template integration/quality tests scan committed template trees and generated Codex output: `test/skill-quality.test.js` and `test/template-settings.test.js`.

**E2E Tests:**
- No browser or external-service E2E framework is used.
- CLI spawn tests in `test/install-regression.test.js` are the closest end-to-end coverage for package behavior.

## Common Patterns

**Async Testing:**
```typescript
test('copySkills preflights all requested skills before writing', async (t) => {
  const dir = await withTempDir(t);

  await assert.rejects(
    copySkills(dir, ['toon-formatter', 'missing-skill']),
    /Skill not found: missing-skill/,
  );

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'toon-formatter')), false);
});
```

**Error Testing:**
```typescript
test('manifest validation rejects bad shapes', () => {
  assert.throws(() => validateManifest({ version: 2 }), /Unsupported skogai.json version/);
  assert.throws(() => validateManifest({ version: 1, profile: 'nope' }), /Unknown profile/);
});

test('copyAll refuses to clobber an existing .claude without force or merge', async (t) => {
  const dir = await withTempDir(t);
  await mkdir(join(dir, '.claude'), { recursive: true });

  await assert.rejects(copyAll(dir, {}), /already exists/);
});
```

**Filesystem Assertions:**
```typescript
assert.equal(existsSync(join(dir, '.codex', 'skills', 'toon-formatter', 'SKILL.md')), true);

const envExample = await readFile(join(dir, '.env.example'), 'utf-8');
assert.match(envExample, /^GITHUB_PERSONAL_ACCESS_TOKEN=$/m);
```

**Content Quality Assertions:**
```typescript
const markdown = await readFile(file, 'utf8');
const rel = relative(SKILLS_ROOT, file);
assert.ok(lines <= MAX_ENTRYPOINT_LINES, `${rel} has ${lines} lines`);
assert.doesNotMatch(content, /Skill tool/, rel);
```

---

*Testing analysis: 2026-07-08*
