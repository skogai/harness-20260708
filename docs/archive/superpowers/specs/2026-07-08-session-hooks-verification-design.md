# Session Hooks Verification Design

## Summary

This design adds a lifecycle reliability layer for `skogharness`: a session
start brief that injects the next useful context into the agent, and a
stop-time verifier that prevents the agent from ending a turn while local work
lacks verification evidence or restartable state.

The implementation should build on existing adjacent SkogAI pieces instead of
creating a new hook framework:

- `skoghooks` owns Claude hook lifecycle wiring, including `SessionStart`
  context injection and `Stop` hook entrypoints.
- `skogai-jq` owns structured JSON extraction and decision-output patterns for
  hook payloads and harness state.
- `skogai-tests` owns the layered validation shape: focused public-script
  tests, hook fixture tests, then broader Bats/corpus validation when lifecycle
  contracts change.

## Goal

Agents should start with the context they need and should not claim work is
done unless the repository contains durable evidence that the relevant checks
ran and the next session can resume cleanly.

V1 success means:

- `harness brief` can summarize active feature state, handoff state, git dirty
  state, and harness drift in a compact text block.
- A `SessionStart` hook can inject that brief through
  `hookSpecificOutput.additionalContext`.
- `harness verify` can run or check recorded verification for the active
  feature and report actionable failures.
- A `Stop` hook can block completion when required verification or handoff
  evidence is missing.
- Existing `feature_list.json` files with string `evidence` remain readable.
  Legacy string evidence produces a warning when it cannot be mechanically
  checked.

## Architecture

### Harness Commands

`harness brief [dir]`

- Reads `feature_list.json`, `progress.md`, `session-handoff.md`, git status,
  and `harness status`.
- Emits concise plain text by default for terminal use.
- Emits Claude hook JSON when called with `--format claude-context`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Harness brief..."
  }
}
```

`harness verify [dir]`

- Runs verification commands for the active feature when invoked normally.
- Supports `--check-only` for hook use; this validates recorded evidence
  without running expensive commands.
- Supports `--format hook-decision` for `Stop` hooks:

```json
{
  "decision": "block",
  "reason": "Run harness verify . and update progress.md before stopping."
}
```

When all stop checks pass, `--format hook-decision` emits no blocking decision
and exits successfully.

### Feature Evidence

V1 keeps the existing `evidence` string field and adds an optional structured
verification field to feature entries:

```json
{
  "id": "feat-007",
  "status": "done",
  "evidence": "Focused docs check passed.",
  "verification": {
    "commands": [
      {
        "command": "git diff --check -- docs/superpowers/specs/2026-07-08-session-hooks-verification-design.md",
        "cwd": ".",
        "expectedExit": 0,
        "lastRunAt": "2026-07-08T00:00:00+02:00",
        "lastExit": 0,
        "status": "passed",
        "summary": "No whitespace errors."
      }
    ]
  }
}
```

The structured field is additive:

- Existing string-only evidence remains valid for historical completed
  features.
- New completed work should use `verification.commands`.
- `harness verify --check-only` warns on string-only evidence.
- Stop-time blocking applies to the active feature or current dirty work, not
  to old completed features that predate this schema.

### SessionStart Integration

`skoghooks` already has the correct lifecycle boundary: its `SessionStart`
script can emit `hookSpecificOutput.additionalContext`. Harness should add an
opt-in hook command that shells out to `harness brief --format claude-context`.

The injected context must be short and operational:

- active or next unblocked feature;
- current blockers;
- verification command to run next;
- dirty git file count and branch;
- whether native config drift is detected;
- latest handoff recommendation.

The brief must not dump full files into context. It should quote only short
snippets and should point the agent to files when more detail is needed.

### Stop Integration

`skoghooks` already has the correct `Stop` boundary. Harness should add an
opt-in stop hook command that calls `harness verify --check-only --stop-hook
--format hook-decision`.

The stop hook blocks when:

- the repo has modified tracked files but no active feature is recorded;
- the active feature is marked `done` without a passing structured verification
  record;
- `progress.md` or `session-handoff.md` is older than the latest tracked file
  modification in the current worktree;
- `harness status` reports drift and the current work changed harness-managed
  config;
- verification evidence exists but the last run failed.

The stop hook warns but does not block when:

- historical done features only have string evidence;
- untracked files exist outside the active feature and no tracked file changes
  are present;
- `harness status` cannot run because the target is not initialized yet.

The block reason must be prescriptive. It should name the missing action, for
example: "Run `harness verify .`, then update `progress.md` and
`session-handoff.md`."

## Boundaries

- Do not build a new hook framework. Reuse `skoghooks` lifecycle events.
- Do not silently enable hooks in committed shared settings. V1 ships scripts,
  CLI commands, docs, and an opt-in hook config snippet.
- Do not include scope guard or permission tiers in this first implementation.
  Those remain follow-on specs unless stop verification needs a read-only
  helper.
- Do not require immediate migration of existing `feature_list.json` evidence.
- Do not store full command output in `feature_list.json`; store short
  summaries and rely on terminal logs or CI logs for long output.

## Testing Strategy

Use the `skogai-tests` layering model.

Focused command tests:

- `harness brief` summarizes a fixture project with an active feature.
- `harness brief --format claude-context` emits valid hook JSON with
  `additionalContext`.
- `harness verify --check-only` passes when structured evidence is fresh.
- `harness verify --check-only` fails when a done feature lacks structured
  passing evidence.

Hook fixture tests:

- Feed realistic `SessionStart` JSON into the opt-in hook wrapper and assert
  `hookSpecificOutput.additionalContext`.
- Feed realistic `Stop` JSON into the opt-in hook wrapper and assert
  `{"decision":"block","reason":"..."}` when evidence is missing.
- Assert no blocking decision when verification and handoff evidence are
  current.

Regression tests:

- Legacy string evidence produces a warning, not a hard failure for old done
  features.
- Dirty tracked files without an active feature block stop.
- Missing `session-handoff.md` blocks only when tracked changes exist.
- `harness status` failures are reported as warnings unless managed config was
  changed.

## Rollout

1. Add the CLI command core in `src/` with unit tests.
2. Add opt-in hook wrappers and docs, but do not add hooks to
   `templates/.claude/settings.json`.
3. Add the structured evidence schema to harness templates after the verifier
   can read both old and new shapes.
4. Run focused tests and docs whitespace checks before opening the change.
5. After V1 stabilizes, write separate specs for scope guard and permission
   tiers.

## Spec Self-Review

- No placeholders remain.
- V1 success criteria are explicit.
- Dependencies on `skoghooks`, `skogai-jq`, and `skogai-tests` are explicit.
- Startup context and stop-time blocking acceptance tests are listed.
- Rollout is opt-in for hooks and does not change shared hook settings by
  default.
