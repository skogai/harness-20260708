# Requirements: skogharness

## v1 Requirements

### Manifest Configuration CLI

- **MAN-01**: User can initialize a project so `skogai.json` and selected Claude/Codex template outputs are created or updated from one command.
- **MAN-02**: User can sync `skogai.json` into native Claude/Codex configuration while preserving human-authored content outside managed regions.
- **MAN-03**: User can run status checks that report drift between `skogai.json` and generated native agent configuration with a non-zero failure signal when drift exists.
- **MAN-04**: User can add known or custom MCP servers and maintained skills through the CLI without manually editing generated native files.

### Harness State Scaffolding

- **HAR-01**: User can scaffold `feature_list.json`, `progress.md`, `session-handoff.md`, and `init.sh` into a target project with `harness harness-init`.
- **HAR-02**: Generated harness verification commands are detected consistently for the supported Bun/Node target runtime and remain compatible with existing harness-creator templates.
- **HAR-03**: User can discover `harness harness-init` from top-level CLI documentation and understand when to run it.

### Lifecycle Reliability

- **LIFE-01**: User can run `harness brief [dir]` to summarize active feature state, handoff state, git dirty state, and harness drift.
- **LIFE-02**: Claude `SessionStart` integration can receive `harness brief --format claude-context` output as `hookSpecificOutput.additionalContext` JSON.
- **LIFE-03**: User can run `harness verify [dir]` to check or run verification for the active feature using structured evidence.
- **LIFE-04**: Claude `Stop` integration can receive `harness verify --check-only --format hook-decision` output that blocks or warns according to verification state.
- **LIFE-05**: User can opt in to lifecycle hook wrappers without the package enabling shared hooks by default.

### Safety and Drift Hardening

- **SAFE-01**: CLI rejects or warns on likely literal secrets in MCP env/header values and continues to support `${VAR}` placeholders.
- **SAFE-02**: Codex MCP status checks compare rendered MCP content, not only section names, so command, URL, args, env, and header drift are visible.
- **SAFE-03**: Claude MCP status checks surface invalid `.mcp.json` parse errors instead of treating corrupted config as missing config.
- **SAFE-04**: Generated shell hook files are executable after install/sync in supported package environments.

### Verification and Release Confidence

- **REL-01**: Maintainer can run `./init.sh` and receive a complete local verification pass covering install, lint, tests, and harness validation.
- **REL-02**: Maintainer can validate the packaged CLI from a packed or globally installed artifact before publish.
- **REL-03**: Maintainer can inspect concise feature/progress/handoff evidence showing what verification ran and what remains.

## v2 / Deferred

- Broader skogai agent runtime behavior beyond manifest and lifecycle governance.
- Full multi-package-manager parity for this repository's own development workflow.
- Generated manifest JSON Schema for editor validation.
- Large-scale dynamic skill registry or external MCP catalog migration.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAN-01 | Phase 1 | Pending |
| MAN-02 | Phase 1 | Pending |
| MAN-03 | Phase 1 | Pending |
| MAN-04 | Phase 1 | Pending |
| HAR-01 | Phase 2 | Pending |
| HAR-02 | Phase 2 | Pending |
| HAR-03 | Phase 2 | Pending |
| LIFE-01 | Phase 3 | Pending |
| LIFE-02 | Phase 3 | Pending |
| LIFE-03 | Phase 3 | Pending |
| LIFE-04 | Phase 3 | Pending |
| LIFE-05 | Phase 3 | Pending |
| SAFE-01 | Phase 4 | Pending |
| SAFE-02 | Phase 4 | Pending |
| SAFE-03 | Phase 4 | Pending |
| SAFE-04 | Phase 4 | Pending |
| REL-01 | Phase 5 | Pending |
| REL-02 | Phase 5 | Pending |
| REL-03 | Phase 5 | Pending |
