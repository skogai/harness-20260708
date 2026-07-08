# Project: skogharness

## Core Value

Reliable harness CLI — users can initialize, validate, and manage harness projects reliably.

## Success Metric

Developers can use the Bun/Node CLI to initialize agent configuration, scaffold harness state, detect drift, and verify lifecycle evidence without relying on transcript-only state or manual repair.

## Scope

### Goals

- Keep `skogai.json` as the durable source of truth for agent-facing configuration.
- Preserve reliable `harness init`, `harness sync`, `harness status`, and `harness add` workflows for Claude and Codex targets.
- Make `harness harness-init` discoverable, tested, and consistent with harness-creator templates.
- Add lifecycle reliability commands for session-start context and stop-time verification.
- Harden drift, security, and release verification so package consumers can trust generated files.

### Non-Goals

- Do not build a model turn loop or autonomous agent runtime inside `skogharness`.
- Do not restore the retired 40-skill/10-category marketplace vision.
- Do not enable shared Claude hooks by default; lifecycle hooks remain opt-in.
- Do not require full package-manager parity beyond the supported Bun/Node development target for this milestone.
- Do not store secrets, full command output, or durable project state only in host transcripts.

## Constraints

- Runtime is Node.js ESM with explicit `.js` imports and Node `>=18.0.0`.
- Preferred development/runtime verification uses Bun plus Node's built-in `node --test` runner.
- CLI command handlers live in `src/commands/`; shared helpers live in `src/utils/` or domain modules.
- Generated native agent files must be auditable and preserve human-authored content through managed blocks or stable-key merges.
- Real secrets must never be committed; MCP auth should use `${VAR}` placeholders and `.env.example` documentation.
- Template copy paths must keep path traversal and symlink safety checks.
- Run full verification with `./init.sh` before final completion.

## Source Context

- Ingest entry point: `.planning/intel/SYNTHESIS.md`
- Requirements source: synthesized from docs, constraints, and codebase map because PRD extraction produced 0 explicit requirements.
- Conflict report: `.planning/INGEST-CONFLICTS.md` — 0 blockers, 0 warnings.
- Codebase map: `.planning/codebase/`

<decisions>
No ADR-locked decisions were synthesized during ingest. Do not treat any inferred implementation preference as ADR-locked without a future ADR or explicit user decision.
</decisions>

## Key Decisions

| Date | Decision | Source | Status |
|------|----------|--------|--------|
| 2026-07-08 | Use manifest-driven configuration with `skogai.json` as source of truth and native agent config as generated projection. | docs/implementation.md, codebase map | Active |
| 2026-07-08 | Lifecycle reliability should reuse existing CLI/hooks/template systems rather than creating a new hook framework. | docs/superpowers specs/plans | Active |
| 2026-07-08 | Hooks for lifecycle verification are opt-in and must not be enabled in committed shared settings by default. | docs/superpowers specs/plans | Active |

## Implementation Conventions

- Use two-space indentation, single quotes, semicolons, named exports, and explicit `.js` imports.
- Add/update `node:test` coverage for changed behavior.
- Prefer real filesystem and CLI integration tests over mocks.
- Keep command internals testable by returning structured data or throwing; CLI wrappers may render output and set exit behavior.
- Sanitize user-controlled paths/names in errors and logs.
