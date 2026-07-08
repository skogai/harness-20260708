# Constraints Intel

## Constraint: Session hooks verification implementation plan

source: /home/skogix/.local/share/opencode/worktree/3244143f8f169c874a74e2deadf1dcfb1d207d3d/quick-circuit/docs/superpowers/plans/2026-07-08-session-hooks-verification.md
type: protocol
scope: skogharness; lifecycle helpers; harness brief; harness verify; Claude hooks; structured verification evidence; feature list schema; tests; documentation

Content block:
- Build startup context injection and stop-time verification without creating a new hook framework.
- Add CLI-facing lifecycle helpers under `src/` and expose them as `harness brief` and `harness verify`.
- Ship opt-in Claude hook wrappers that call those commands and return JSON shapes used by `skoghooks`.
- Implement lifecycle state reading from `feature_list.json`, `progress.md`, `session-handoff.md`, git state, and optional harness status.
- Implement brief output for terminal text and `SessionStart` `hookSpecificOutput.additionalContext` JSON.
- Implement verification checks for structured evidence and stop-hook blocking decisions.
- Add tests for lifecycle state, brief formatting, verification decisions, hook wrapper behavior, and feature-list schema support for `verification.commands`.
- Keep hooks opt-in and document snippets; do not enable shared hooks by default.
- Run full verification with `./init.sh` before final completion.

## Constraint: Session hooks verification design

source: /home/skogix/.local/share/opencode/worktree/3244143f8f169c874a74e2deadf1dcfb1d207d3d/quick-circuit/docs/superpowers/specs/2026-07-08-session-hooks-verification-design.md
type: protocol
scope: skogharness; harness brief; harness verify; SessionStart hook; Stop hook; feature_list.json; verification.commands; progress.md; session-handoff.md; skoghooks; skogai-jq; skogai-tests

Content block:
- Add a lifecycle reliability layer: session-start brief plus stop-time verifier.
- Reuse adjacent systems instead of creating a new hook framework: `skoghooks` for lifecycle wiring, `skogai-jq` for JSON extraction/decision output patterns, and `skogai-tests` for layered validation.
- `harness brief [dir]` must summarize active feature state, handoff state, git dirty state, and harness drift; `--format claude-context` emits `hookSpecificOutput.additionalContext` for `SessionStart`.
- `harness verify [dir]` runs or checks verification for the active feature; `--check-only --format hook-decision` supports `Stop` hooks.
- Feature entries retain string `evidence` compatibility and add optional `verification.commands` records with command, cwd, expected exit, run timestamp, last exit, status, and summary.
- Stop hooks block on modified tracked files without active feature, done active feature without passing structured evidence, stale progress/handoff relative to tracked modifications, relevant harness drift, or failed verification evidence.
- Stop hooks warn on historical string-only evidence, untracked-only changes outside the active feature, or harness status being unavailable before initialization.
- Do not silently enable hooks in committed shared settings; V1 ships scripts, CLI commands, docs, and opt-in config snippets.
- Do not store full command output in `feature_list.json`; store short summaries and rely on logs for long output.
- Test through focused command tests, hook fixture tests, and regressions for legacy evidence, dirty tracked files, missing handoff, and harness status failures.

## Constraint: skogharness harness blueprint

source: /home/skogix/.local/share/opencode/worktree/3244143f8f169c874a74e2deadf1dcfb1d207d3d/quick-circuit/docs/harness-blueprint.md
type: protocol
scope: skogharness; agentic system; harness governance; session lifecycle; feature_list.json; progress.md; session-handoff.md; skogai.json; harness sync; permission tiers; verification evidence; recovery model

Content block:
- skogharness does not run the model turn loop; it governs configuration, state, instructions, and audit around Claude Code or Codex.
- Governance planes: config (`skogai.json` → `harness sync` → native config), state (`harness harness-init` scaffolding), instruction (`AGENTS.md`/`CLAUDE.md`), and audit (`harness-creator` validation).
- Durable restart state lives in `feature_list.json`, `progress.md`, docs, git history, and `session-handoff.md`; nothing durable should live only in host transcript.
- Outer loop: init, orient, select one feature, plan, act, verify, record, exit.
- Stop conditions include repeated verification failure, required out-of-scope edits, incomplete dependency features, or context degradation.
- Manifest is the source of truth for tool capability; direct native config edits are drift.
- Generated output should be auditable through managed blocks and drift detection.
- Destructive actions, manifest changes, and merges to `master` require human approval.
- Implementation sequence prioritizes verification-backed evidence, session-start mechanism, scope guard, permission tiers, and outer-loop validation.

## Constraint: Project specs

source: /home/skogix/.local/share/opencode/worktree/3244143f8f169c874a74e2deadf1dcfb1d207d3d/quick-circuit/docs/specs.md
type: schema
scope: skogharness; manifest; skills; MCP servers; stack profiles; CLI; runtime; commands; security boundaries

Content block:
- Package identity: `skogharness` v4.0.0, MIT, binaries `skogharness` and `harness` from `bin/cli.js`.
- Runtime: Node.js ESM, explicit `.js` imports, minimum Node `>=18.0.0`, bun lock committed, `node --test` test runner.
- CLI framework: `commander`; runtime dependencies include `chalk`, `commander`, `fs-extra`, `inquirer`, `ora`.
- Structure: command handlers in `src/commands/`, manifest/schema logic in `src/manifest.js`, agent/profile/MCP definitions in `src/agents.js`, `src/profiles.js`, and `src/mcps.js`, shared helpers in `src/utils/`, templates in `templates/`, tests in `test/`.
- Commands and scripts: `bun install`, `bun run lint`, `bun test`/`npm test`, `bun run test:security`, `bun run install:global`, and `prepublishOnly`.
- Coding conventions: two-space indentation, single quotes, semicolons, named exports, explicit `.js` imports, unused args prefixed with `_`.
- Security boundaries: no committed secrets; placeholder env values; `src/utils/security.js` validates paths, skill paths, command names, and sanitizes logs.
