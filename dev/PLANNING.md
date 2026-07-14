# Skogharness Basic Structure Plan

## Purpose

Mirror the useful workflow shape from `.example/superclaude/` into `skogharness/` without building the full system yet.

This first slice is intentionally small: persistent dev docs, one example agent, one example command, and one basic hook definition.

## Source Model

- `.example/` is inspiration only.
- `.example/superclaude/` is the reference for package shape and workflow categories.
- `skogharness/` is the target implementation area.

## Phase 1 Scope

Create the smallest useful structure:

- `dev/PLANNING.md` for plan and scope.
- `dev/TASK.md` for the active checklist.
- `dev/KNOWLEDGE.md` for decisions and lessons.
- `src/skogharness/agents/example.md` as a minimal agent example.
- `src/skogharness/commands/example.md` as a minimal command example.
- `src/skogharness/hooks/README.md` and `hooks.json` as a basic hook example.

## Out Of Scope

- No installer changes.
- No tests in this phase.
- No MCP setup.
- No runtime hook scripts.
- No root repository entrypoint changes.
- No `harness-creator` changes.
- No contributing, versioning, doctor, drift detection, or release work.

## Acceptance Criteria

- The basic files exist under `skogharness/`.
- The examples are clearly marked as examples.
- The hook config is documentation/example material, not claimed as active runtime behavior.
- Future work can build tests and installer behavior around this structure later.
