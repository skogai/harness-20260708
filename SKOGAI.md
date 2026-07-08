# Repository Guidelines

## Project Structure & Module Organization

This repository is a Node.js ESM CLI package for `skogharness`. Runtime source lives in `src/`, with command handlers in `src/commands/` and shared helpers in `src/utils/`. The executable entry point is `bin/cli.js`, exposed as both `skogharness` and `harness`. Tests live in `test/` and use `*.test.js` naming. Agent and plugin templates are under `templates/`, with plugin metadata in `.claude-plugin/`. Keep generated dependencies in `node_modules/` out of commits.

## Build, Test, and Development Commands

- `bun install`: install dependencies from `bun.lock`.
- `bun run lint`: run ESLint across `src/`, `test/`, `bin/`, and template utilities.
- `bun test` or `npm test`: run the Node test suite via `node --test`.
- `bun run test:security`: run focused security-related tests in `test/*.test.js`.
- `bun run install:global`: run `scripts/install-global.sh` for a local global install.
- `node bin/cli.js status .`: exercise the CLI against the current repo during development.

## Coding Style & Naming Conventions

Use modern JavaScript modules with explicit `.js` imports. Follow the existing style: two-space indentation, single quotes, semicolons, and named exports for public helpers. CLI commands should live in `src/commands/<name>.js`; reusable logic should go in `src/utils/` or the relevant top-level module. ESLint enforces recommended JavaScript rules and permits unused function arguments only when prefixed with `_`.

## Testing Guidelines

Use the built-in `node:test` runner and `node:assert/strict`. Place tests in `test/` with descriptive names such as `manifest-sync.test.js` or `security-hardening.test.js`. Prefer temporary directories from `node:fs/promises` for filesystem tests, and register cleanup with `t.after()`. Add or update tests whenever behavior changes in manifest parsing, syncing, CLI commands, security checks, or template output.

## Agent Startup Workflow

- Read `feature_list.json`, `progress.md`, and `session-handoff.md` before writing code.
- Use `./init.sh` as the full verification entrypoint.
- For narrow docs-only work, record the focused commands that were run instead.
- Keep the session restartable by updating feature status, blockers, verification evidence, and next steps.

## Scope Control

- One feature at a time: pick one active feature from `feature_list.json` and keep edits scoped to it.
- Stay in scope: do not mix template, CLI, docs, and unrelated cleanup changes unless the active feature requires them.
- Preserve existing user changes and work with them instead of reverting them.

## Definition of Done

- The relevant feature entry has current status and evidence.
- `progress.md` or `session-handoff.md` records what changed, what remains, and any blockers.
- The appropriate verification command has passed, or its failure is documented with the next action.

## End of Session

- Update `feature_list.json` with the latest feature status and evidence.
- Update `progress.md` with completed work, modified files, decisions, and verification evidence.
- Update `session-handoff.md` with blockers, risks, and the recommended next step before ending.

## Commit & Pull Request Guidelines

Recent history uses short imperative subjects, often with Conventional Commit prefixes such as `feat: add harness creator skill`; keep that format for new work. Keep commits focused and avoid mixing template, CLI, and unrelated cleanup changes. Pull requests should describe the user-visible change, list validation commands run, link related issues when available, and include screenshots or terminal output only when the CLI behavior or generated files are easier to review visually.

## Security & Configuration Tips

Do not commit real tokens, local agent secrets, or generated user config. When adding MCP or environment handling, prefer placeholder variables such as `${GITHUB_PERSONAL_ACCESS_TOKEN}` and update `.env.example` behavior through managed sync code.

<harness:skills>
## Harness skills

When a user request matches one of the skills below, read the matching local skill file before answering, planning, or editing.

- `harness-creator`: Build, audit, and improve harnesses that make AI coding agents reliable: AGENTS.md/CLAUDE.md instruction files, feature/state tracking, verification gates, scope boundaries, session handoff, memory persistence, context budgets, tool-permission safety, and multi-agent coordination. Use this whenever a coding agent is unreliable across sessions — forgets context, drifts out of scope, claims "done" before tests pass, or starts each session inconsistently — or when creating or assessing AGENTS.md, CLAUDE.md, feature_list.json, init.sh, progress.md, or session-handoff files. Reach for it even if the user never says the word harness.
  Read `.codex/skills/harness-creator/SKILL.md` before using this skill.
- `toon-formatter`: Guidance on when and how to use TOON (Token-Oriented Object Notation) — a compact JSON alternative that typically cuts input tokens 30-50% on tabular data. Use when the user is about to paste or serialize a large JSON array into a prompt, has a payload with ≥5 uniform objects, or is optimizing an LLM pipeline for cost/context. Knows the format shapes (tabular `[N]{a,b}:` rows, inline `[N]: ...`, expanded), when TOON helps vs hurts, and how to invoke installed TOON commands or wrappers when available. Example queries — "convert this API response to TOON", "will this JSON benefit from TOON", "how does TOON handle nested objects".
  Read `.codex/skills/toon-formatter/SKILL.md` before using this skill.
- `agent-entrypoint-design`: Use when designing or refactoring AGENTS.md, CLAUDE.md, GEMINI.md, Cursor rules, GitHub instructions, source-of-truth navigation, or agent onboarding entrypoints.
  Read `.codex/skills/agent-entrypoint-design/SKILL.md` before using this skill.
- `agent-ledger-and-delivery`: Use when designing agent_chats or agents_chat records, delivery evidence summaries, linked tasks or commits, validation notes, risks, review notes, or handoff records.
  Read `.codex/skills/agent-ledger-and-delivery/SKILL.md` before using this skill.
- `atomic-commit-discipline`: Use when splitting changes into atomic commits, preparing commits from mixed worktrees, staging exact paths, including related task-state updates, writing Conventional Commits, or preventing unrelated changes.
  Read `.codex/skills/atomic-commit-discipline/SKILL.md` before using this skill.
- `design-doc-and-task-board`: Use when deciding how requirements should be captured in design docs, tasks.md, external task systems, exec plans, acceptance criteria, status updates, or planning source-of-truth files.
  Read `.codex/skills/design-doc-and-task-board/SKILL.md` before using this skill.
- `quality-gardening`: Use when designing quality snapshots, generated quality reports, structural metrics, debt thresholds, regression budgets, quality gates, or gradual cleanup loops.
  Read `.codex/skills/quality-gardening/SKILL.md` before using this skill.
- `repo-contracts-and-boundaries`: Use when turning architecture, layering, directory ownership, dependency direction, file-size limits, choke points, baselines, or allowlists into repository checks.
  Read `.codex/skills/repo-contracts-and-boundaries/SKILL.md` before using this skill.
- `repo-harness-assessment`: Use when evaluating an existing repository's agent-readiness, harness maturity, validation surfaces, source-of-truth docs, evidence artifacts, or next smallest harness improvement.
  Read `.codex/skills/repo-harness-assessment/SKILL.md` before using this skill.
- `runtime-evidence-and-tracing`: Use when connecting observed behavior, logs, metrics, request IDs, run IDs, screenshots, traces, external dependency results, or artifacts into a runtime evidence loop.
  Read `.codex/skills/runtime-evidence-and-tracing/SKILL.md` before using this skill.
- `validation-harness-design`: Use when designing repository validation commands, doctor scripts, test matrices, JSON or JUnit outputs, CI gates, smoke checks, or harness command surfaces.
  Read `.codex/skills/validation-harness-design/SKILL.md` before using this skill.
</harness:skills>
