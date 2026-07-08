# Codebase Structure

**Analysis Date:** 2026-07-08

## Directory Layout

```
quick-circuit/
├── bin/                         # Executable CLI entry point
├── src/                         # Runtime ESM source
│   ├── commands/                # CLI command handlers
│   └── utils/                   # Shared filesystem, security, and helper modules
├── test/                        # Node built-in test suite (`*.test.js`)
├── templates/                   # Files copied into initialized target projects
│   ├── .claude/                 # Claude Code template tree, skills, commands, hooks, utilities
│   ├── blocks/                  # Managed block Markdown snippets used during sync
│   └── codex/                   # Codex template tree
├── docs/                        # Architecture, implementation, specs, plans, and feature notes
├── scripts/                     # Development/install shell scripts
├── .claude-plugin/              # Claude Code plugin marketplace metadata
├── .planning/codebase/          # GSD-generated codebase maps
├── package.json                 # Package metadata, binaries, dependencies, scripts
├── bun.lock                     # Bun lockfile
├── eslint.config.js             # ESLint flat config
├── init.sh                      # Repository verification entrypoint
├── AGENTS.md                    # Agent-facing repository workflow and conventions
├── CLAUDE.md                    # Claude-facing repository guidance
├── feature_list.json            # Harness feature tracker
├── progress.md                  # Harness progress record
└── session-handoff.md           # Restart handoff state
```

## Directory Purposes

**`bin/`:**
- Purpose: Contains package executable files declared in `package.json`.
- Contains: Node shebang ESM CLI scripts.
- Key files: `bin/cli.js`.

**`src/`:**
- Purpose: Runtime implementation for the `skogharness` package.
- Contains: Public package exports, command handlers, domain registries, manifest/MCP logic, and utilities.
- Key files: `src/index.js`, `src/manifest.js`, `src/agents.js`, `src/profiles.js`, `src/mcps.js`.

**`src/commands/`:**
- Purpose: One module per CLI workflow.
- Contains: `init`, `harness-init`, `sync`, `status`, and `add` command implementations.
- Key files: `src/commands/init.js`, `src/commands/sync.js`, `src/commands/status.js`, `src/commands/add.js`, `src/commands/harness-init.js`.

**`src/utils/`:**
- Purpose: Shared helpers for filesystem projection, managed sections, TOON setup, and security validation.
- Contains: Copy helpers, managed block helpers, command/skill/path validation, TOON wrapper inspection.
- Key files: `src/utils/copy.js`, `src/utils/managed-block.js`, `src/utils/security.js`, `src/utils/toon.js`.

**`test/`:**
- Purpose: Node test suite for runtime behavior, security hardening, templates, install scripts, and regressions.
- Contains: `*.test.js` files using `node:test` and `node:assert/strict`.
- Key files: `test/manifest-sync.test.js`, `test/security-hardening.test.js`, `test/template-settings.test.js`, `test/skill-quality.test.js`, `test/install-global-script.test.js`, `test/install-regression.test.js`.

**`templates/`:**
- Purpose: Source tree for files copied into target projects by init/sync commands.
- Contains: Claude and Codex agent scaffolds, maintained skills, commands, hooks, managed block snippets, TOON utility wrapper, harness state templates.
- Key files: `templates/.claude/skills/harness-creator/SKILL.md`, `templates/.claude/skills/toon-formatter/skill.md`, `templates/blocks/claude-skills.md`, `templates/blocks/codex-skills.md`, `templates/codex/README.md`.

**`templates/.claude/`:**
- Purpose: Claude Code template root copied to target `.claude/` outputs.
- Contains: Claude settings, README, slash-command Markdown files, shell hooks, utility scripts, skills.
- Key files: `templates/.claude/settings.json`, `templates/.claude/README.md`, `templates/.claude/utils/toon/cli.mjs`, `templates/.claude/hooks/secret-scanner.sh`.

**`templates/.claude/skills/harness-creator/`:**
- Purpose: Maintained skill for creating and validating harness-managed projects.
- Contains: `SKILL.md`, reference docs, scripts, evaluation fixtures, template state files, and agent definitions.
- Key files: `templates/.claude/skills/harness-creator/SKILL.md`, `templates/.claude/skills/harness-creator/scripts/validate-harness.mjs`, `templates/.claude/skills/harness-creator/templates/feature-list.json`.

**`templates/.claude/skills/toon-formatter/`:**
- Purpose: Maintained skill for TOON formatting guidance.
- Contains: Skill Markdown and reference guide.
- Key files: `templates/.claude/skills/toon-formatter/skill.md`, `templates/.claude/skills/toon-formatter/references/toon-guide.md`.

**`templates/blocks/`:**
- Purpose: Snippets rendered into managed guidance blocks during sync.
- Contains: Markdown templates with placeholder replacement.
- Key files: `templates/blocks/claude-skills.md`, `templates/blocks/codex-skills.md`.

**`templates/codex/`:**
- Purpose: Codex-facing template content copied to target `.codex/` outputs.
- Contains: Codex README and generated skill layout destination source.
- Key files: `templates/codex/README.md`.

**`docs/`:**
- Purpose: Human-readable implementation rationale, features, specs, and superpower plans.
- Contains: Markdown documentation and nested planning/spec artifacts.
- Key files: `docs/implementation.md`, `docs/harness-blueprint.md`, `docs/features.md`, `docs/specs.md`, `docs/superpowers/specs/2026-07-08-session-hooks-verification-design.md`.

**`scripts/`:**
- Purpose: Repository-maintained utility scripts.
- Contains: Shell scripts used by package development/install workflows.
- Key files: `scripts/install-global.sh`.

**`.claude-plugin/`:**
- Purpose: Claude Code plugin marketplace metadata.
- Contains: Marketplace manifest and plugin README.
- Key files: `.claude-plugin/marketplace.json`, `.claude-plugin/README.md`.

**`.planning/codebase/`:**
- Purpose: GSD codebase mapping output used by planning/execution agents.
- Contains: Architecture and structure maps for this focus area.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.

## Key File Locations

**Entry Points:**
- `bin/cli.js`: CLI binary entry; defines `init`, `harness-init`, `sync`, `status`, `add mcp`, and `add skill` commands.
- `src/index.js`: Programmatic ESM entry exporting command handlers and reusable helpers.
- `init.sh`: Repository verification/startup script for contributors and agents.

**Configuration:**
- `package.json`: Package metadata, binary mappings, scripts, dependencies, Node engine, Bun package manager version.
- `bun.lock`: Dependency lockfile for Bun.
- `eslint.config.js`: ESLint flat config for `src/`, `test/`, `bin/`, `bench/`, and template utility scripts.
- `.gitignore`: Ignore rules for dependencies, local settings, secrets, archives, backups, build output, and generated scratch output.
- `.claude-plugin/marketplace.json`: Marketplace metadata for plugin installation.
- `AGENTS.md`: Agent-facing development workflow and repository conventions.
- `CLAUDE.md`: Claude-facing local guidance.

**Core Logic:**
- `src/commands/init.js`: Project initialization and profile/skill install workflow.
- `src/commands/sync.js`: Manifest projection into native Claude/Codex configuration.
- `src/commands/status.js`: Drift detection.
- `src/commands/add.js`: Manifest mutation for adding skills and MCP entries.
- `src/commands/harness-init.js`: Harness state file scaffold.
- `src/manifest.js`: Manifest schema validation, load/save, and resolution.
- `src/mcps.js`: MCP catalog, validation, environment reference collection, Claude JSON rendering, and Codex TOML rendering.
- `src/utils/copy.js`: Template copying and agent-specific skill projection.
- `src/utils/managed-block.js`: Managed block upsert/read primitives.
- `src/utils/security.js`: Path and input safety primitives.

**Testing:**
- `test/manifest-sync.test.js`: Manifest validation, resolution, sync/status behavior, MCP rendering, managed block behavior.
- `test/security-hardening.test.js`: Command/path/log sanitization and local settings template safety.
- `test/skill-quality.test.js`: Skill/template quality checks.
- `test/template-settings.test.js`: Template settings behavior.
- `test/install-global-script.test.js`: Global install script behavior.
- `test/install-regression.test.js`: Installation regression coverage.

**Templates and Generated Output Sources:**
- `templates/.claude/settings.json`: Claude settings template.
- `templates/.claude/commands/*.md`: Claude slash-command templates copied by selected profiles.
- `templates/.claude/hooks/*.sh`: Claude hook templates.
- `templates/.claude/utils/toon/cli.mjs`: TOON utility wrapper copied when TOON is enabled.
- `templates/.claude/skills/*`: Maintained skill source directories.
- `templates/blocks/*.md`: Managed block snippets rendered into `CLAUDE.md` and `AGENTS.md`.
- `templates/codex/README.md`: Codex target README template.

**Harness State:**
- `feature_list.json`: Feature tracking state for harness-managed work.
- `progress.md`: Session progress/evidence record.
- `session-handoff.md`: Cross-session handoff notes.
- `templates/.claude/skills/harness-creator/templates/*`: Source templates used by `harness harness-init`.

## Naming Conventions

**Files:**
- Runtime source uses lowercase kebab or plain descriptive names with `.js`: `src/commands/harness-init.js`, `src/utils/managed-block.js`, `src/mcps.js`.
- CLI command modules live at `src/commands/<command>.js`: `src/commands/sync.js`, `src/commands/status.js`.
- Utility modules live at `src/utils/<topic>.js`: `src/utils/security.js`, `src/utils/copy.js`.
- Tests use descriptive `*.test.js` names in `test/`: `test/manifest-sync.test.js`, `test/security-hardening.test.js`.
- Template commands use kebab-case Markdown names: `templates/.claude/commands/toon-encode.md`, `templates/.claude/commands/convert-to-toon.md`.
- Skill directories use stable skill ids: `templates/.claude/skills/harness-creator/`, `templates/.claude/skills/toon-formatter/`.

**Directories:**
- Runtime command handlers go in `src/commands/`.
- Shared runtime helpers go in `src/utils/`.
- Copied agent templates remain under `templates/<agent-or-block>/`.
- Claude-specific template content stays under `templates/.claude/`.
- Codex-specific template content stays under `templates/codex/`.
- Harness creator support files stay under `templates/.claude/skills/harness-creator/` by artifact type: `scripts/`, `references/`, `templates/`, `evals/`, `agents/`.

## Where to Add New Code

**New CLI Command:**
- Primary code: Add `src/commands/<name>.js` and wire it in `bin/cli.js`.
- Public export: Add to `src/index.js` only when programmatic consumers need it.
- Tests: Add or extend `test/<name>.test.js` or a behavior-focused existing test such as `test/manifest-sync.test.js`.

**New Manifest Field:**
- Primary code: Add validation and resolution in `src/manifest.js`.
- Target projection: Add use of the resolved field in `src/commands/sync.js` or a target-specific helper.
- Tests: Add validation/resolution cases to `test/manifest-sync.test.js`.

**New Agent Target:**
- Registry: Add target metadata in `src/agents.js`.
- Templates: Add target template content under `templates/<target>/`.
- Projection: Add a target syncer in `src/commands/sync.js` and copy behavior in `src/utils/copy.js` if skill layout differs.
- Status: Add drift checks in `src/commands/status.js`.
- Tests: Add sync/status coverage to `test/manifest-sync.test.js`.

**New MCP Catalog Entry or MCP Shape:**
- Catalog/validation/rendering: Update `src/mcps.js`.
- Manifest path: Keep MCP entries flowing through `src/manifest.js` validation.
- Tests: Add catalog, validation, env collection, and rendering cases to `test/manifest-sync.test.js`.

**New Profile or Skill Id:**
- Registry: Add the skill id and profile membership in `src/profiles.js`.
- Template source: Add skill content under `templates/.claude/skills/<skill-id>/`.
- Codex projection: Ensure skill Markdown uses `SKILL.md` or `skill.md` so `src/utils/copy.js` can translate it.
- Tests: Add/adjust skill quality and sync coverage in `test/skill-quality.test.js` and `test/manifest-sync.test.js`.

**New Template File:**
- Claude template: Place under `templates/.claude/` in the same layout expected in target `.claude/`.
- Codex template: Place under `templates/codex/`.
- Managed snippet: Place under `templates/blocks/` and render it from `src/commands/sync.js`.
- Tests: Add template-specific coverage under `test/` when output behavior or safety changes.

**New Filesystem Helper:**
- Shared helper: Add to `src/utils/<topic>.js` if used by multiple commands.
- Command-local helper: Keep private inside `src/commands/<command>.js` if the behavior only belongs to that command.
- Security: Reuse `src/utils/security.js` for path, command name, and logging validation.

**New Harness State Scaffold Artifact:**
- Template: Add source file under `templates/.claude/skills/harness-creator/templates/`.
- Scaffold mapping: Add mapping in `STATE_FILES` in `src/commands/harness-init.js`.
- Tests: Add scaffold coverage to an existing or new `test/*.test.js` file.

**Utilities:**
- Shared helpers: `src/utils/`.
- Runtime registries: `src/agents.js`, `src/profiles.js`, `src/mcps.js`.
- Template-only scripts: `templates/.claude/skills/harness-creator/scripts/` or `templates/.claude/utils/` depending on the generated project location.

## Special Directories

**`templates/.claude/skills/`:**
- Purpose: Source of maintained skills distributed by the package.
- Generated: No; these are authored source templates.
- Committed: Yes.

**`templates/.claude/skills/harness-creator/templates/`:**
- Purpose: Source templates for `feature_list.json`, `progress.md`, `session-handoff.md`, `init.sh`, and related harness state scaffolds.
- Generated: No; copied by `src/commands/harness-init.js`.
- Committed: Yes.

**`templates/.claude/hooks/`:**
- Purpose: Optional Claude Code hook scripts copied into target projects.
- Generated: No; copied template content.
- Committed: Yes.

**`templates/blocks/`:**
- Purpose: Managed block snippets rendered into root guidance files during sync.
- Generated: No; rendered output is generated in target projects.
- Committed: Yes.

**`.claude-plugin/`:**
- Purpose: Claude Code plugin marketplace metadata for repository-distributed skills.
- Generated: No.
- Committed: Yes.

**`.planning/codebase/`:**
- Purpose: Generated GSD codebase maps for downstream planning agents.
- Generated: Yes.
- Committed: Project-dependent; files are written for planning workflows.

**`node_modules/`:**
- Purpose: Installed package dependencies.
- Generated: Yes.
- Committed: No; ignored by `.gitignore`.

**`.claude/skills/`:**
- Purpose: Locally installed generated Claude skills when this repo is a target project.
- Generated: Yes.
- Committed: No; ignored by `.gitignore`.

**`.env*`:**
- Purpose: Local environment variables and secrets.
- Generated: User/local.
- Committed: No; `.env`, `.env.local`, `.env.development.local`, `.env.test.local`, and `.env.production.local` are ignored by `.gitignore`.

---

*Structure analysis: 2026-07-08*
