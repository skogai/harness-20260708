# Phase 1: Manifest CLI Reliability - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers practical reliability for the existing manifest-driven CLI loop: users can initialize a target project, project `skogai.json` into Claude/Codex native files, inspect drift, and add MCP servers or maintained skills without manually editing generated files.

This phase does not redefine the harness architecture. The deeper harness use case is durable agent turns, but under the current roadmap Phase 1 stays focused on the manifest CLI behaviors in MAN-01 through MAN-04.

</domain>

<decisions>
## Implementation Decisions

### Harness Purpose and Turn Model
- **D-01:** The harness's biggest use case is an immutable turn model: every hook, action, event, change, or thought is represented by a JSON object appended to an immutable data store / JSONL until a commit and git diff are created representing the message, file state, and actions taken. That complete unit is a "turn."
- **D-02:** Do not implement, design, or focus planning effort on the immutable turn log in Phase 1. This is architectural context and roadmap pressure, not Phase 1 implementation scope.
- **D-03:** Downstream agents must not mistake manifest sync for the full harness purpose. `skogai.json` and generated native files are part of the current CLI projection layer, not the long-term event-store model.

### Real Usage Loop Boundary
- **D-04:** The real harness usage loop is: a turn starts with an agent getting context and ends with a reminder / validation.
- **D-05:** Under the current roadmap, that loop belongs to later lifecycle work, not Phase 1. Capture it as a roadmap concern to rework later.
- **D-06:** Phase 1 should remain practical: make the existing init/sync/status/add CLI behavior reliable and avoid decisions that would make the later turn lifecycle harder.

### the agent's Discretion
- The planner may choose the specific implementation sequence for MAN-01 through MAN-04 using existing code patterns, provided it does not introduce turn-log implementation work into Phase 1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Source
- `.planning/PROJECT.md` — Project scope, constraints, non-goals, and key decisions.
- `.planning/REQUIREMENTS.md` — MAN-01 through MAN-04 define Phase 1 requirements.
- `.planning/ROADMAP.md` — Current phase boundary and success criteria.
- `.planning/STATE.md` — Current planning position and deferred items.

### Codebase Map
- `.planning/codebase/ARCHITECTURE.md` — Manifest/projection architecture, command responsibilities, data flow, anti-patterns.
- `.planning/codebase/STACK.md` — Runtime stack, package manager, dependencies, and configuration sources.
- `.planning/codebase/CONVENTIONS.md` — Naming, command-handler, error-handling, testing, and style conventions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/manifest.js` — Durable manifest load/validate/save/resolve path for `skogai.json`.
- `src/commands/init.js` — Existing initialization flow and target/profile selection patterns.
- `src/commands/sync.js` — Existing projection path for Claude/Codex outputs, `.mcp.json`, `.env.example`, and managed blocks.
- `src/commands/status.js` — Existing drift reporting entry point and non-zero status behavior.
- `src/commands/add.js` — Existing narrow manifest mutation flow for MCP and skill additions.
- `src/utils/managed-block.js` and `src/utils/copy.js` — Preservation and safe filesystem projection utilities.

### Established Patterns
- Keep CLI command wrappers responsible for user output and exits; keep testable internals returning structured data or throwing.
- Preserve human-authored content by using managed blocks or stable-key merges rather than whole-file rewrites.
- Treat `skogai.json` as the current manifest source for generated native files.
- Use `node:test` and filesystem-oriented integration tests for changed CLI behavior.

### Integration Points
- `bin/cli.js` wires public commands and aliases.
- `src/index.js` exports programmatic entry points.
- `templates/` provides generated Claude/Codex content and must remain safely copied.
- `test/manifest-sync.test.js`, `test/security-hardening.test.js`, and related CLI tests are likely verification anchors for Phase 1.

</code_context>

<specifics>
## Specific Ideas

- The term "turn" means the immutable unit that begins when an agent receives context and ends when reminder/validation plus commit/diff evidence complete the record.
- The roadmap likely needs later rework so the real harness usage loop is primary. Do not make Phase 1 solve that mismatch.

</specifics>

<deferred>
## Deferred Ideas

- Immutable turn JSONL/event store as the full harness architecture: every hook, action, event, change, and thought is append-only until a commit and git diff complete the turn. Not implemented or focused in Phase 1.
- Roadmap rework so the real harness usage loop is central: a turn starts with an agent getting context and ends with a reminder / validation.

</deferred>

---

*Phase: 1-Manifest CLI Reliability*
*Context gathered: 2026-07-08*
