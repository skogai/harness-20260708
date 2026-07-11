# Session Hooks Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build startup context injection and stop-time verification for `skogharness` without creating a new hook framework.

**Architecture:** Add small CLI-facing lifecycle helpers under `src/` and expose them as `harness brief` and `harness verify`. Ship opt-in Claude hook wrapper scripts that call those commands and return the same JSON shapes already used by `skoghooks`.

**Tech Stack:** Node.js ESM, Commander, `node:test`, `node:assert/strict`, existing `fs-extra` dependency, shell wrappers for Claude hooks.

---

## File Structure

- Create `src/lifecycle/state.js`: read feature, progress, handoff, git, and drift state.
- Create `src/lifecycle/brief.js`: format terminal and Claude context brief output.
- Create `src/lifecycle/verify.js`: check structured evidence and build stop-hook decisions.
- Create `src/commands/brief.js`: CLI command wrapper for brief generation.
- Create `src/commands/verify.js`: CLI command wrapper for verification checks.
- Modify `bin/cli.js`: register `brief` and `verify`.
- Modify `src/index.js`: export reusable command handlers.
- Create `templates/.claude/hooks/harness-session-start.sh`: opt-in SessionStart wrapper.
- Create `templates/.claude/hooks/harness-stop-verify.sh`: opt-in Stop wrapper.
- Modify `templates/.claude/hooks/README.md`: document opt-in hook snippets.
- Create `test/lifecycle-brief.test.js`: fixture tests for startup context.
- Create `test/lifecycle-verify.test.js`: fixture tests for stop verification.
- Modify `templates/.claude/skills/harness-creator/templates/feature-list.schema.json`: allow optional structured verification records.

## Task 1: Lifecycle State Reader

**Files:**
- Create: `src/lifecycle/state.js`
- Test: `test/lifecycle-brief.test.js`

- [ ] **Step 1: Write failing state reader tests**

Add this test file:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadLifecycleState } from '../src/lifecycle/state.js';

async function fixtureProject() {
  const dir = await mkdtemp(join(tmpdir(), 'harness-lifecycle-'));
  await writeFile(join(dir, 'feature_list.json'), JSON.stringify({
    features: [
      {
        id: 'feat-001',
        name: 'Done',
        description: 'completed feature',
        dependencies: [],
        status: 'done',
        evidence: 'legacy evidence'
      },
      {
        id: 'feat-002',
        name: 'Active',
        description: 'active feature',
        dependencies: ['feat-001'],
        status: 'in-progress',
        evidence: ''
      }
    ]
  }, null, 2));
  await writeFile(join(dir, 'progress.md'), '# Session Progress Log\n\n## Current State\n\nActive feature in progress.\n');
  await writeFile(join(dir, 'session-handoff.md'), '# Session Handoff\n\n## Recommended Next Step\n\nRun verification.\n');
  await mkdir(join(dir, '.git'), { recursive: true });
  return dir;
}

test('loadLifecycleState reads active feature and handoff snippets', async () => {
  const dir = await fixtureProject();
  const state = await loadLifecycleState(dir, { runHarnessStatus: false });

  assert.equal(state.activeFeature.id, 'feat-002');
  assert.equal(state.nextFeature, null);
  assert.match(state.progressSummary, /Active feature in progress/);
  assert.match(state.handoffSummary, /Run verification/);
});

test('loadLifecycleState returns next unblocked feature when none is active', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'harness-lifecycle-'));
  await writeFile(join(dir, 'feature_list.json'), JSON.stringify({
    features: [
      {
        id: 'feat-001',
        name: 'Ready',
        description: 'ready feature',
        dependencies: [],
        status: 'not-started',
        evidence: ''
      }
    ]
  }, null, 2));

  const state = await loadLifecycleState(dir, { runHarnessStatus: false });

  assert.equal(state.activeFeature, null);
  assert.equal(state.nextFeature.id, 'feat-001');
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test test/lifecycle-brief.test.js
```

Expected: FAIL with a module-not-found error for `src/lifecycle/state.js`.

- [ ] **Step 3: Implement the state reader**

Create `src/lifecycle/state.js`:

```js
import { readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { pathExists } from 'fs-extra';
import { spawnSync } from 'child_process';

const SNIPPET_LIMIT = 600;

async function readOptional(path) {
  if (!(await pathExists(path))) return '';
  return readFile(path, 'utf8');
}

function firstSnippet(value) {
  const text = String(value || '').trim();
  return text.length > SNIPPET_LIMIT ? `${text.slice(0, SNIPPET_LIMIT)}...` : text;
}

function dependencyDone(features, dependencyId) {
  return features.some((feature) => feature.id === dependencyId && feature.status === 'done');
}

function pickActiveFeature(features) {
  return features.find((feature) => feature.status === 'in-progress') || null;
}

function pickNextFeature(features) {
  return features.find((feature) => {
    if (feature.status !== 'not-started') return false;
    return (feature.dependencies || []).every((dependencyId) => dependencyDone(features, dependencyId));
  }) || null;
}

function gitStatus(targetDir) {
  const branchResult = spawnSync('git', ['-C', targetDir, 'rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8',
  });
  const statusResult = spawnSync('git', ['-C', targetDir, 'status', '--porcelain'], {
    encoding: 'utf8',
  });
  const branch = branchResult.status === 0 ? branchResult.stdout.trim() : 'unknown';
  const lines = statusResult.status === 0 && statusResult.stdout.trim()
    ? statusResult.stdout.trim().split('\n')
    : [];
  const trackedChanges = lines.filter((line) => !line.startsWith('?? '));
  const untrackedChanges = lines.filter((line) => line.startsWith('?? '));
  return {
    branch,
    dirty: lines.length > 0,
    changedCount: lines.length,
    trackedCount: trackedChanges.length,
    untrackedCount: untrackedChanges.length,
    files: lines,
  };
}

function harnessStatus(targetDir, enabled) {
  if (!enabled) return { checked: false, ok: null, message: 'not checked' };
  const result = spawnSync('node', [resolve('bin/cli.js'), 'status', targetDir], {
    encoding: 'utf8',
  });
  return {
    checked: true,
    ok: result.status === 0,
    message: firstSnippet(`${result.stdout}\n${result.stderr}`),
  };
}

async function fileMtime(path) {
  if (!(await pathExists(path))) return null;
  return (await stat(path)).mtime;
}

export async function loadLifecycleState(dir = '.', options = {}) {
  const targetDir = resolve(dir);
  const featureListPath = join(targetDir, 'feature_list.json');
  const progressPath = join(targetDir, 'progress.md');
  const handoffPath = join(targetDir, 'session-handoff.md');
  const featureListText = await readOptional(featureListPath);
  const featureList = featureListText ? JSON.parse(featureListText) : { features: [] };
  const features = Array.isArray(featureList.features) ? featureList.features : [];

  return {
    targetDir,
    featureListPath,
    progressPath,
    handoffPath,
    features,
    activeFeature: pickActiveFeature(features),
    nextFeature: pickNextFeature(features),
    progressSummary: firstSnippet(await readOptional(progressPath)),
    handoffSummary: firstSnippet(await readOptional(handoffPath)),
    git: gitStatus(targetDir),
    harnessStatus: harnessStatus(targetDir, options.runHarnessStatus !== false),
    mtimes: {
      featureList: await fileMtime(featureListPath),
      progress: await fileMtime(progressPath),
      handoff: await fileMtime(handoffPath),
    },
  };
}
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
node --test test/lifecycle-brief.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit task 1**

```bash
git add src/lifecycle/state.js test/lifecycle-brief.test.js
git commit -m "feat: add lifecycle state reader"
```

## Task 2: Brief Formatter and CLI Command

**Files:**
- Create: `src/lifecycle/brief.js`
- Create: `src/commands/brief.js`
- Modify: `bin/cli.js`
- Modify: `src/index.js`
- Test: `test/lifecycle-brief.test.js`

- [ ] **Step 1: Extend the failing tests for brief output**

Append to `test/lifecycle-brief.test.js`:

```js
import { buildBriefText, buildClaudeContextOutput } from '../src/lifecycle/brief.js';

test('buildBriefText includes feature, git, and next action context', async () => {
  const dir = await fixtureProject();
  const state = await loadLifecycleState(dir, { runHarnessStatus: false });
  const text = buildBriefText(state);

  assert.match(text, /Harness Brief/);
  assert.match(text, /feat-002/);
  assert.match(text, /Git:/);
  assert.match(text, /Next action:/);
});

test('buildClaudeContextOutput emits SessionStart additionalContext', async () => {
  const dir = await fixtureProject();
  const state = await loadLifecycleState(dir, { runHarnessStatus: false });
  const output = buildClaudeContextOutput(state);

  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(output.hookSpecificOutput.additionalContext, /Harness Brief/);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test test/lifecycle-brief.test.js
```

Expected: FAIL with a module-not-found error for `src/lifecycle/brief.js`.

- [ ] **Step 3: Implement brief formatting**

Create `src/lifecycle/brief.js`:

```js
function featureLine(label, feature) {
  if (!feature) return `${label}: none`;
  return `${label}: ${feature.id} - ${feature.name} (${feature.status})`;
}

export function buildBriefText(state) {
  const target = state.activeFeature || state.nextFeature;
  const nextAction = state.activeFeature
    ? 'Continue the active feature, then run harness verify before marking done.'
    : state.nextFeature
      ? `Start ${state.nextFeature.id} only if the user has asked for implementation.`
      : 'No unblocked feature found; ask for direction before editing.';

  return [
    'Harness Brief',
    `Workspace: ${state.targetDir}`,
    featureLine('Active feature', state.activeFeature),
    featureLine('Next unblocked feature', state.nextFeature),
    `Git: branch ${state.git.branch}, ${state.git.changedCount} changed file(s), ${state.git.trackedCount} tracked`,
    `Harness drift: ${state.harnessStatus.checked ? (state.harnessStatus.ok ? 'clean' : 'drift detected') : 'not checked'}`,
    `Next action: ${nextAction}`,
    target ? `Feature description: ${target.description}` : '',
    state.handoffSummary ? `Latest handoff:\n${state.handoffSummary}` : 'Latest handoff: none',
  ].filter(Boolean).join('\n');
}

export function buildClaudeContextOutput(state) {
  return {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: buildBriefText(state),
    },
  };
}
```

- [ ] **Step 4: Add CLI command wrapper**

Create `src/commands/brief.js`:

```js
import { loadLifecycleState } from '../lifecycle/state.js';
import { buildBriefText, buildClaudeContextOutput } from '../lifecycle/brief.js';

export async function brief(dir = '.', options = {}) {
  const state = await loadLifecycleState(dir, {
    runHarnessStatus: options.harnessStatus !== false,
  });

  if (options.format === 'claude-context') {
    console.log(JSON.stringify(buildClaudeContextOutput(state)));
    return;
  }

  console.log(buildBriefText(state));
}
```

Modify `bin/cli.js`:

```js
import { brief } from '../src/commands/brief.js';
```

Register the command before `program.parse()`:

```js
program
  .command('brief [dir]')
  .description('Print startup context from harness state files')
  .option('--format <format>', 'Output format: text or claude-context', 'text')
  .option('--no-harness-status', 'Skip harness status drift check')
  .action(brief);
```

Modify `src/index.js`:

```js
export { brief } from './commands/brief.js';
```

- [ ] **Step 5: Run the focused test and CLI smoke**

Run:

```bash
node --test test/lifecycle-brief.test.js
node bin/cli.js brief . --no-harness-status
node bin/cli.js brief . --format claude-context --no-harness-status | jq -e '.hookSpecificOutput.additionalContext'
```

Expected: test PASS; first CLI command prints `Harness Brief`; second CLI command exits 0 and `jq` prints the context string.

- [ ] **Step 6: Commit task 2**

```bash
git add bin/cli.js src/index.js src/commands/brief.js src/lifecycle/brief.js test/lifecycle-brief.test.js
git commit -m "feat: add harness brief command"
```

## Task 3: Verify Core and CLI Command

**Files:**
- Create: `src/lifecycle/verify.js`
- Create: `src/commands/verify.js`
- Modify: `bin/cli.js`
- Modify: `src/index.js`
- Test: `test/lifecycle-verify.test.js`

- [ ] **Step 1: Write failing verification tests**

Create `test/lifecycle-verify.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadLifecycleState } from '../src/lifecycle/state.js';
import { verifyLifecycleState, buildHookDecision } from '../src/lifecycle/verify.js';

async function projectWithFeature(feature) {
  const dir = await mkdtemp(join(tmpdir(), 'harness-verify-'));
  await writeFile(join(dir, 'feature_list.json'), JSON.stringify({ features: [feature] }, null, 2));
  await writeFile(join(dir, 'progress.md'), '# Session Progress Log\n\n## Evidence of Completion\n\nRecorded.\n');
  await writeFile(join(dir, 'session-handoff.md'), '# Session Handoff\n\n## Recommended Next Step\n\nReview.\n');
  return dir;
}

test('verifyLifecycleState passes done feature with structured passing evidence', async () => {
  const dir = await projectWithFeature({
    id: 'feat-001',
    name: 'Done',
    description: 'done feature',
    dependencies: [],
    status: 'done',
    evidence: 'done',
    verification: {
      commands: [{
        command: 'npm test',
        cwd: '.',
        expectedExit: 0,
        lastRunAt: '2026-07-08T00:00:00+02:00',
        lastExit: 0,
        status: 'passed',
        summary: 'tests passed'
      }]
    }
  });
  const state = await loadLifecycleState(dir, { runHarnessStatus: false });
  const result = verifyLifecycleState(state, { stopHook: true });

  assert.equal(result.ok, true);
  assert.deepEqual(result.blockers, []);
});

test('verifyLifecycleState blocks done feature without structured evidence', async () => {
  const dir = await projectWithFeature({
    id: 'feat-001',
    name: 'Done',
    description: 'done feature',
    dependencies: [],
    status: 'done',
    evidence: 'legacy evidence'
  });
  const state = await loadLifecycleState(dir, { runHarnessStatus: false });
  const result = verifyLifecycleState(state, { stopHook: true });

  assert.equal(result.ok, false);
  assert.match(result.blockers[0], /structured verification/);
});

test('buildHookDecision emits block JSON when verification fails', async () => {
  const decision = buildHookDecision({
    ok: false,
    blockers: ['Run harness verify .'],
    warnings: []
  });

  assert.equal(decision.decision, 'block');
  assert.match(decision.reason, /Run harness verify/);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test test/lifecycle-verify.test.js
```

Expected: FAIL with a module-not-found error for `src/lifecycle/verify.js`.

- [ ] **Step 3: Implement check-only verification**

Create `src/lifecycle/verify.js`:

```js
function structuredCommands(feature) {
  return Array.isArray(feature?.verification?.commands) ? feature.verification.commands : [];
}

function hasPassingCommand(feature) {
  return structuredCommands(feature).some((command) => {
    const expectedExit = command.expectedExit ?? 0;
    return command.status === 'passed' && command.lastExit === expectedExit && command.lastRunAt;
  });
}

export function verifyLifecycleState(state, options = {}) {
  const blockers = [];
  const warnings = [];
  const activeOrDone = state.activeFeature || state.features.find((feature) => feature.status === 'done');

  for (const feature of state.features.filter((item) => item.status === 'done')) {
    if (!hasPassingCommand(feature)) {
      const message = `${feature.id} is done but has no passing structured verification record.`;
      if (options.stopHook && feature === activeOrDone) blockers.push(`${message} Run harness verify . before stopping.`);
      else warnings.push(`${message} Legacy string evidence is not mechanically checked.`);
    }
  }

  if (state.git.trackedCount > 0 && !state.activeFeature && !state.features.some((feature) => feature.status === 'done')) {
    blockers.push('Tracked files changed but no active or completed feature is recorded in feature_list.json.');
  }

  if (state.git.trackedCount > 0 && !state.progressSummary) {
    blockers.push('Tracked files changed but progress.md is missing or empty.');
  }

  if (state.git.trackedCount > 0 && !state.handoffSummary) {
    blockers.push('Tracked files changed but session-handoff.md is missing or empty.');
  }

  return {
    ok: blockers.length === 0,
    blockers,
    warnings,
  };
}

export function buildHookDecision(result) {
  if (result.ok) return null;
  return {
    decision: 'block',
    reason: result.blockers.join('\n'),
  };
}
```

- [ ] **Step 4: Add CLI command wrapper**

Create `src/commands/verify.js`:

```js
import { loadLifecycleState } from '../lifecycle/state.js';
import { verifyLifecycleState, buildHookDecision } from '../lifecycle/verify.js';

export async function verify(dir = '.', options = {}) {
  const state = await loadLifecycleState(dir, {
    runHarnessStatus: options.harnessStatus !== false,
  });
  const result = verifyLifecycleState(state, {
    stopHook: Boolean(options.stopHook),
    checkOnly: Boolean(options.checkOnly),
  });

  if (options.format === 'hook-decision') {
    const decision = buildHookDecision(result);
    if (decision) console.log(JSON.stringify(decision));
    process.exitCode = result.ok ? 0 : 2;
    return;
  }

  for (const warning of result.warnings) console.warn(`warning: ${warning}`);
  for (const blocker of result.blockers) console.error(`blocker: ${blocker}`);
  process.exitCode = result.ok ? 0 : 1;
}
```

Modify `bin/cli.js`:

```js
import { verify } from '../src/commands/verify.js';
```

Register the command before `program.parse()`:

```js
program
  .command('verify [dir]')
  .description('Check harness feature evidence and stop-time completion state')
  .option('--check-only', 'Only check recorded evidence; do not run verification commands')
  .option('--stop-hook', 'Apply stop-hook blocking rules')
  .option('--format <format>', 'Output format: text or hook-decision', 'text')
  .option('--no-harness-status', 'Skip harness status drift check')
  .action(verify);
```

Modify `src/index.js`:

```js
export { verify } from './commands/verify.js';
```

- [ ] **Step 5: Run focused verification tests**

Run:

```bash
node --test test/lifecycle-verify.test.js test/lifecycle-brief.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit task 3**

```bash
git add bin/cli.js src/index.js src/commands/verify.js src/lifecycle/verify.js test/lifecycle-verify.test.js
git commit -m "feat: add harness verify command"
```

## Task 4: Opt-In Hook Wrappers and Documentation

**Files:**
- Create: `templates/.claude/hooks/harness-session-start.sh`
- Create: `templates/.claude/hooks/harness-stop-verify.sh`
- Modify: `templates/.claude/hooks/README.md`
- Test: `test/lifecycle-verify.test.js`

- [ ] **Step 1: Add hook wrapper tests**

Append to `test/lifecycle-verify.test.js`:

```js
import { spawnSync } from 'node:child_process';

test('harness stop hook wrapper can emit a blocking decision', async () => {
  const result = spawnSync('bash', ['templates/.claude/hooks/harness-stop-verify.sh'], {
    cwd: process.cwd(),
    input: '{"hook_event_name":"Stop","session_id":"test"}',
    encoding: 'utf8',
  });

  assert.equal([0, 2].includes(result.status), true);
  if (result.stdout.trim()) {
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.decision, 'block');
  }
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test test/lifecycle-verify.test.js
```

Expected: FAIL because `templates/.claude/hooks/harness-stop-verify.sh` does not exist.

- [ ] **Step 3: Add hook wrapper scripts**

Create `templates/.claude/hooks/harness-session-start.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

node "$PROJECT_DIR/bin/cli.js" brief "$PROJECT_DIR" --format claude-context
```

Create `templates/.claude/hooks/harness-stop-verify.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

node "$PROJECT_DIR/bin/cli.js" verify "$PROJECT_DIR" --check-only --stop-hook --format hook-decision
```

Make both executable:

```bash
chmod +x templates/.claude/hooks/harness-session-start.sh templates/.claude/hooks/harness-stop-verify.sh
```

- [ ] **Step 4: Document opt-in hook snippets**

Add this section to `templates/.claude/hooks/README.md`:

```md
### Harness Lifecycle Hooks (Opt In)

These hooks are not enabled by default. Add them to project or local Claude
settings only when the repository uses `feature_list.json`, `progress.md`, and
`session-handoff.md`.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/harness-session-start.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/harness-stop-verify.sh"
          }
        ]
      }
    ]
  }
}
```
```

- [ ] **Step 5: Run focused hook tests**

Run:

```bash
node --test test/lifecycle-verify.test.js test/lifecycle-brief.test.js
git diff --check -- templates/.claude/hooks/README.md templates/.claude/hooks/harness-session-start.sh templates/.claude/hooks/harness-stop-verify.sh
```

Expected: tests PASS; diff check PASS.

- [ ] **Step 6: Commit task 4**

```bash
git add templates/.claude/hooks/README.md templates/.claude/hooks/harness-session-start.sh templates/.claude/hooks/harness-stop-verify.sh test/lifecycle-verify.test.js
git commit -m "feat: add opt-in harness lifecycle hooks"
```

## Task 5: Structured Evidence Template Schema

**Files:**
- Modify: `templates/.claude/skills/harness-creator/templates/feature-list.schema.json`
- Test: `test/skill-quality.test.js`

- [ ] **Step 1: Write schema validation assertion**

Add this test to `test/skill-quality.test.js`:

```js
test('feature list schema supports structured verification evidence', () => {
  const schema = JSON.parse(readFileSync('templates/.claude/skills/harness-creator/templates/feature-list.schema.json', 'utf8'));
  const featureProperties = schema.properties.features.items.properties;

  assert.equal(featureProperties.verification.type, 'object');
  assert.equal(featureProperties.verification.properties.commands.type, 'array');
  assert.equal(featureProperties.verification.properties.commands.items.properties.command.type, 'string');
  assert.equal(featureProperties.verification.properties.commands.items.properties.expectedExit.type, 'number');
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test test/skill-quality.test.js
```

Expected: FAIL because `verification` is not in the schema.

- [ ] **Step 3: Extend feature-list schema**

In `templates/.claude/skills/harness-creator/templates/feature-list.schema.json`, add this sibling property next to `evidence`:

```json
"verification": {
  "type": "object",
  "description": "Structured verification records for machine-checkable evidence",
  "properties": {
    "commands": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "command": { "type": "string" },
          "cwd": { "type": "string" },
          "expectedExit": { "type": "number" },
          "lastRunAt": { "type": "string" },
          "lastExit": { "type": "number" },
          "status": { "type": "string", "enum": ["passed", "failed"] },
          "summary": { "type": "string" }
        },
        "required": ["command", "expectedExit"]
      }
    }
  }
}
```

- [ ] **Step 4: Run schema and quality tests**

Run:

```bash
node --test test/skill-quality.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit task 5**

```bash
git add templates/.claude/skills/harness-creator/templates/feature-list.schema.json test/skill-quality.test.js
git commit -m "feat: add structured verification schema"
```

## Task 6: Final Verification and Docs

**Files:**
- Modify: `README.md`
- Modify: `docs/features.md`
- Modify: `feature_list.json`
- Modify: `progress.md`
- Modify: `session-handoff.md`

- [ ] **Step 1: Document new CLI commands in README**

Add these lines to the README usage block:

```md
harness brief [dir]             # print active feature, handoff, git, and drift context
harness verify [dir]            # check machine-readable verification evidence
```

- [ ] **Step 2: Update feature docs**

Move session lifecycle reliability from aspirational runtime direction into `Need` or `Have` depending on implementation completion. Use this exact `Have` bullet after implementation:

```md
- `harness brief [dir]` / `harness verify [dir]` — lifecycle reliability commands for startup context and stop-time verification evidence. Hook wrappers are shipped as opt-in Claude hooks, not enabled by default.
```

- [ ] **Step 3: Update harness state files**

Add a new feature entry:

```json
{
  "id": "feat-007",
  "name": "Session hooks verification",
  "description": "Add startup context injection and stop-time verification planning for harness lifecycle reliability.",
  "dependencies": ["feat-006"],
  "status": "done",
  "evidence": "Implemented harness brief/verify commands, opt-in hook wrappers, structured evidence schema, and tests.",
  "verification": {
    "commands": [
      {
        "command": "./init.sh",
        "cwd": ".",
        "expectedExit": 0,
        "lastExit": 0,
        "status": "passed",
        "summary": "Full repository verification passed."
      }
    ]
  }
}
```

Set `lastRunAt` to the actual timestamp when `./init.sh` passes.

- [ ] **Step 4: Run full verification**

Run:

```bash
./init.sh
```

Expected: install, lint, tests, and harness audit pass.

- [ ] **Step 5: Commit final documentation and state**

```bash
git add README.md docs/features.md feature_list.json progress.md session-handoff.md
git commit -m "docs: document session lifecycle verification"
```

## Self-Review Checklist

- Spec coverage: startup brief, SessionStart integration, stop verification,
  Stop integration, `skogai-jq` role, `skogai-tests` role, compatibility, and
  opt-in rollout are represented in tasks.
- Placeholder scan: no placeholder instructions are present; every task names
  exact files, commands, expected results, and commit messages.
- Type consistency: `verification.commands`, `hookSpecificOutput`, `decision`,
  `reason`, `brief`, and `verify` names are consistent across tasks.
