# Roadmap: skogharness

## Overview

This roadmap turns the existing manifest-driven CLI into a reliably verifiable harness toolchain: first lock down the core init/sync/status/add workflows, then make harness state scaffolding complete and discoverable, add lifecycle brief/verify commands with opt-in hooks, harden drift and secret safety, and finish with release-grade verification evidence.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Manifest CLI Reliability** - Users can initialize, sync, inspect, and extend manifest-driven agent configuration confidently.
- [ ] **Phase 2: Harness State Scaffolding** - Users can scaffold restartable harness state with documented, tested Bun/Node verification commands.
- [ ] **Phase 3: Lifecycle Brief and Verification** - Users and opt-in Claude hooks can receive session-start context and stop-time verification decisions.
- [ ] **Phase 4: Safety and Drift Hardening** - Users get accurate drift signals and safer generated configuration around secrets, MCP files, and hooks.
- [ ] **Phase 5: Release Confidence** - Maintainers can verify the repository and packaged CLI with concise evidence before shipping.

## Phase Details

### Phase 1: Manifest CLI Reliability
**Goal**: Users can initialize, sync, inspect, and extend manifest-driven agent configuration confidently.
**Depends on**: Nothing (first phase)
**Requirements**: MAN-01, MAN-02, MAN-03, MAN-04
**Success Criteria** (what must be TRUE):
  1. User can run `harness init` and see `skogai.json` plus selected Claude/Codex outputs created or updated.
  2. User can run `harness sync` repeatedly and see generated native config match the manifest without clobbering human-authored content.
  3. User can run `harness status` and receive a clear success or drift failure signal for generated outputs.
  4. User can add MCP servers and maintained skills through CLI commands and see the manifest and generated outputs reconcile.
**Plans**: TBD

### Phase 2: Harness State Scaffolding
**Goal**: Users can scaffold restartable harness state with documented, tested Bun/Node verification commands.
**Depends on**: Phase 1
**Requirements**: HAR-01, HAR-02, HAR-03
**Success Criteria** (what must be TRUE):
  1. User can run `harness harness-init` and receive `feature_list.json`, `progress.md`, `session-handoff.md`, and `init.sh` in the target project.
  2. User targeting Bun + Node tests receives generated verification commands that match the repository's expected lint/test flow.
  3. User can find `harness harness-init` in top-level documentation and understand its relationship to normal `harness init`.
  4. Maintainer can verify the CLI scaffold behavior through automated tests instead of manual inspection.
**Plans**: TBD

### Phase 3: Lifecycle Brief and Verification
**Goal**: Users and opt-in Claude hooks can receive session-start context and stop-time verification decisions.
**Depends on**: Phase 2
**Requirements**: LIFE-01, LIFE-02, LIFE-03, LIFE-04, LIFE-05
**Success Criteria** (what must be TRUE):
  1. User can run `harness brief [dir]` and see active feature, handoff, git dirty state, and harness drift summarized.
  2. Claude `SessionStart` hook users can opt in to JSON context that supplies `hookSpecificOutput.additionalContext`.
  3. User can run `harness verify [dir]` and see whether the active feature has acceptable structured verification evidence.
  4. Claude `Stop` hook users can opt in to block/warn decisions for dirty tracked files, missing passing evidence, stale handoff state, and harness drift.
  5. Users can install lifecycle hook wrappers intentionally without shared package settings enabling them by default.
**Plans**: TBD

### Phase 4: Safety and Drift Hardening
**Goal**: Users get accurate drift signals and safer generated configuration around secrets, MCP files, and hooks.
**Depends on**: Phase 3
**Requirements**: SAFE-01, SAFE-02, SAFE-03, SAFE-04
**Success Criteria** (what must be TRUE):
  1. User adding MCP env/header values receives protection against likely literal secrets while placeholder values still work.
  2. User changing Codex MCP command, URL, args, env, or headers sees `harness status` report drift.
  3. User with corrupted `.mcp.json` sees an explicit parse/config error from status instead of a misleading missing-config report.
  4. User installing hook templates receives executable shell hook files in generated target outputs.
**Plans**: TBD

### Phase 5: Release Confidence
**Goal**: Maintainers can verify the repository and packaged CLI with concise evidence before shipping.
**Depends on**: Phase 4
**Requirements**: REL-01, REL-02, REL-03
**Success Criteria** (what must be TRUE):
  1. Maintainer can run `./init.sh` and see install, lint, test, and harness validation pass together.
  2. Maintainer can exercise the packaged or globally installed CLI before publish and confirm the binary entry points work.
  3. Maintainer can inspect feature/progress/handoff files and see current verification evidence plus remaining blockers, if any.
  4. Package consumers receive a CLI release path whose required checks are documented by evidence rather than transcript memory.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Manifest CLI Reliability | 0/TBD | Not started | - |
| 2. Harness State Scaffolding | 0/TBD | Not started | - |
| 3. Lifecycle Brief and Verification | 0/TBD | Not started | - |
| 4. Safety and Drift Hardening | 0/TBD | Not started | - |
| 5. Release Confidence | 0/TBD | Not started | - |
