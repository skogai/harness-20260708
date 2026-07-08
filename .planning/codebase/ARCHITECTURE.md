<!-- refreshed: 2026-07-08 -->
# Architecture

**Analysis Date:** 2026-07-08

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                       CLI / Public API                       │
├──────────────────┬──────────────────┬───────────────────────┤
│ CLI dispatcher   │ Command handlers │ Programmatic exports  │
│ `bin/cli.js`     │ `src/commands/`  │ `src/index.js`        │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Manifest Resolution Layer                   │
│ `src/manifest.js`, `src/profiles.js`, `src/agents.js`,       │
│ `src/mcps.js`                                                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                Filesystem Projection / Templates             │
│ `src/utils/copy.js`, `src/utils/managed-block.js`,           │
│ `src/utils/security.js`, `src/utils/toon.js`, `templates/`   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Target project outputs                                      │
│  `skogai.json`, `.claude/`, `.codex/`, `.mcp.json`,          │
│  `CLAUDE.md`, `AGENTS.md`, `.env.example`                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| CLI dispatcher | Defines `harness`/`skogharness` commands, options, default `init` behavior, and subcommands. | `bin/cli.js` |
| Public API | Re-exports command handlers and shared helpers for package consumers. | `src/index.js` |
| Init command | Selects profiles/skills, installs templates for agent targets, writes `skogai.json`, and invokes sync. | `src/commands/init.js` |
| Harness state scaffold | Creates restartable project state files and verification script from harness-creator templates. | `src/commands/harness-init.js` |
| Sync command | Resolves the manifest into a plan and projects skills/MCPs into native Claude and Codex config. | `src/commands/sync.js` |
| Status command | Compares generated projections against the resolved manifest and reports drift. | `src/commands/status.js` |
| Add command | Mutates `skogai.json` for individual MCP or skill additions, then runs sync. | `src/commands/add.js` |
| Manifest contract | Loads, validates, saves, and resolves `skogai.json` into an executable install/sync plan. | `src/manifest.js` |
| Agent target registry | Defines supported agent targets and target alias expansion. | `src/agents.js` |
| Profile registry | Defines installable skills, profiles, command bundles, and TOON/hook flags. | `src/profiles.js` |
| MCP model | Defines catalog entries, MCP validation, environment reference collection, and target config rendering. | `src/mcps.js` |
| Copy/template utilities | Copies skills, commands, hooks, agent essentials, and support files while enforcing path and symlink safety. | `src/utils/copy.js` |
| Managed block utilities | Replaces tagged generated regions while preserving human-authored surrounding content. | `src/utils/managed-block.js` |
| Security utilities | Validates path boundaries, skill paths, command names, and log output. | `src/utils/security.js` |
| TOON utility check | Verifies the copied TOON CLI wrapper exists as a regular file. | `src/utils/toon.js` |

## Pattern Overview

**Overall:** Manifest-driven CLI with generated native projections.

**Key Characteristics:**
- `skogai.json` is the source of truth for targets, profiles, skills, MCPs, and model settings (`src/manifest.js:8`, `src/manifest.js:15`, `src/manifest.js:84`).
- CLI commands are thin orchestration layers that delegate reusable behavior to manifest, registry, and utility modules (`bin/cli.js:23`, `src/commands/sync.js:139`, `src/commands/add.js:28`).
- Generated output is either copied from `templates/`, merged by stable keys, or isolated in managed blocks (`src/utils/copy.js:276`, `src/commands/sync.js:38`, `src/utils/managed-block.js:19`).
- Security boundaries are explicit around file copying, command names, skill paths, symlinks, and log rendering (`src/utils/security.js:10`, `src/utils/copy.js:31`, `src/utils/copy.js:317`).

## Layers

**CLI Layer:**
- Purpose: Parse user commands and route to command handlers.
- Location: `bin/cli.js`
- Contains: Commander command registration, CLI options, subcommand wiring, package version loading.
- Depends on: `commander`, `fs`, `url`, `path`, `src/commands/*`.
- Used by: Package binaries `skogharness` and `harness` declared in `package.json`.

**Command Layer:**
- Purpose: Implement user workflows: initialize, scaffold harness state, sync, status, add MCPs, add skills.
- Location: `src/commands/`
- Contains: `src/commands/init.js`, `src/commands/harness-init.js`, `src/commands/sync.js`, `src/commands/status.js`, `src/commands/add.js`.
- Depends on: Domain registries in `src/manifest.js`, `src/profiles.js`, `src/agents.js`, `src/mcps.js`; filesystem utilities in `src/utils/`.
- Used by: `bin/cli.js` and public exports from `src/index.js`.

**Manifest/Domain Layer:**
- Purpose: Represent durable configuration and convert it into concrete execution plans.
- Location: `src/manifest.js`, `src/profiles.js`, `src/agents.js`, `src/mcps.js`
- Contains: Manifest validation, profile definitions, skill ids, supported agent targets, MCP catalog, target-specific MCP rendering.
- Depends on: Node filesystem/path APIs and lightweight utility validation.
- Used by: Commands and tests in `test/manifest-sync.test.js`.

**Filesystem Projection Layer:**
- Purpose: Write native agent files safely and idempotently.
- Location: `src/utils/`
- Contains: Template copying, skill translation for Codex, generated block upsert/read, TOON wrapper checks, path validation.
- Depends on: `fs-extra`, `node:fs/promises`, `path`, `url`, `src/agents.js`, `src/utils/security.js`.
- Used by: `src/commands/init.js`, `src/commands/sync.js`, `src/commands/status.js`, `src/commands/harness-init.js`.

**Template Content Layer:**
- Purpose: Store copied agent scaffolding, skills, hooks, commands, and harness state templates.
- Location: `templates/`
- Contains: Claude templates under `templates/.claude/`, Codex templates under `templates/codex/`, managed block templates under `templates/blocks/`.
- Depends on: Runtime copy paths from `src/utils/copy.js` and `src/commands/sync.js`.
- Used by: Init/sync/scaffold commands and template quality tests.

**Test/Verification Layer:**
- Purpose: Validate manifest behavior, sync/status behavior, template safety, install scripts, and security hardening.
- Location: `test/`, `init.sh`
- Contains: `node:test` suites and repository verification entrypoint.
- Depends on: Public/internal modules from `src/`, template files, scripts under `templates/.claude/skills/harness-creator/scripts/`.
- Used by: Development workflow and release checks.

## Data Flow

### Primary Request Path

1. User invokes a binary such as `harness sync .`; Commander routes the command in `bin/cli.js:42` to `src/commands/sync.js:158`.
2. `runSync()` resolves the target directory and loads `skogai.json` through `loadManifest()` (`src/commands/sync.js:139`, `src/manifest.js:58`).
3. `resolveManifest()` validates and merges profile defaults with explicit manifest values (`src/manifest.js:84`).
4. `runSync()` dispatches each resolved target to `TARGET_SYNCERS` (`src/commands/sync.js:112`, `src/commands/sync.js:147`).
5. Claude sync copies essentials/skills/commands, writes `CLAUDE.md` managed skills block, and merges `.mcp.json` by MCP key (`src/commands/sync.js:70`, `src/commands/sync.js:86`, `src/commands/sync.js:91`).
6. Codex sync copies essentials/skills, writes the root `AGENTS.md` skills block, and writes Codex TOML MCP tables inside a managed block (`src/commands/sync.js:94`, `src/commands/sync.js:97`, `src/commands/sync.js:102`).
7. MCP environment placeholders are collected and appended to `.env.example` without reading real `.env` files (`src/commands/sync.js:117`, `src/commands/sync.js:151`).
8. The CLI prints summary and unset environment variable names only (`src/commands/sync.js:161`, `src/commands/sync.js:170`).

### Initialization Flow

1. User invokes default `harness init [dir]`; `bin/cli.js:23` routes to `src/commands/init.js:107`.
2. `init()` parses agent targets and detects existing `.claude`, `.codex`, or `AGENTS.md` outputs (`src/commands/init.js:109`, `src/commands/init.js:54`).
3. Interactive or option-driven profile/skill selection builds an install plan (`src/commands/init.js:137`, `src/commands/init.js:170`).
4. Per-target install functions copy template content (`src/commands/init.js:72`, `src/commands/init.js:101`).
5. `writeManifest()` creates or updates `skogai.json` (`src/commands/init.js:23`, `src/commands/init.js:219`).
6. `runSync()` normalizes generated outputs after install (`src/commands/init.js:220`).

### Add Flow

1. User invokes `harness add mcp <name>` or `harness add skill <name>` through `bin/cli.js:55` and `bin/cli.js:66`.
2. `addMcp()` loads `skogai.json`, validates either catalog or explicit MCP entries, writes the manifest, and syncs (`src/commands/add.js:28`).
3. `addSkill()` verifies the skill id against `SKILLS`, writes the manifest, and syncs (`src/commands/add.js:63`).

### Status / Drift Flow

1. User invokes `harness status [dir]`; `bin/cli.js:47` routes to `src/commands/status.js:87`.
2. `getStatus()` loads and resolves `skogai.json` (`src/commands/status.js:52`, `src/commands/status.js:54`).
3. Per target, installed skills are checked with `isAgentSkillInstalled()` (`src/commands/status.js:61`, `src/utils/copy.js:388`).
4. Claude MCP drift is calculated by comparing resolved MCP entries with `.mcp.json` keys (`src/commands/status.js:26`).
5. Codex MCP presence is calculated by reading the managed TOML block (`src/commands/status.js:44`).
6. `status()` prints in-sync or drifted target summaries and sets `process.exitCode = 1` when drift exists (`src/commands/status.js:79`, `src/commands/status.js:116`).

**State Management:**
- Durable configuration state lives in target project `skogai.json`, loaded/saved by `src/manifest.js`.
- Generated native state lives in target `.claude/`, `.codex/`, `.mcp.json`, `CLAUDE.md`, `AGENTS.md`, and `.env.example` outputs written by `src/commands/sync.js` and `src/utils/copy.js`.
- Runtime process state is local variables only; no long-lived daemon or database is used.
- Harness-managed work tracking files (`feature_list.json`, `progress.md`, `session-handoff.md`, `init.sh`) are scaffolded by `src/commands/harness-init.js`.

## Key Abstractions

**Manifest:**
- Purpose: Durable project-level agent configuration.
- Examples: `src/manifest.js`, target `skogai.json`.
- Pattern: Validate before use, save as pretty JSON, resolve to a concrete plan.

**Resolved Plan:**
- Purpose: Normalized command input containing targets, skills, MCPs, commands, model mappings, and feature flags.
- Examples: `src/manifest.js:84`, `src/commands/sync.js:145`, `test/manifest-sync.test.js:48`.
- Pattern: Merge profile defaults first, then explicit manifest values; de-duplicate skills; override MCPs by name.

**Agent Target:**
- Purpose: Encapsulates an agent's id, display name, and output directory.
- Examples: `src/agents.js:1`, `src/utils/copy.js:126`, `src/commands/sync.js:112`.
- Pattern: Registry lookup with alias expansion; target-specific sync functions own native output format.

**Skill:**
- Purpose: Copyable agent capability shipped under templates and identified by a stable id.
- Examples: `src/profiles.js:1`, `templates/.claude/skills/harness-creator/SKILL.md`, `templates/.claude/skills/toon-formatter/skill.md`.
- Pattern: Claude skills copy as directories; Codex skills render a normalized `SKILL.md` with support files (`src/utils/copy.js:233`).

**MCP Entry:**
- Purpose: Declarative server definition for stdio or HTTPS MCP clients.
- Examples: `src/mcps.js:9`, `src/mcps.js:41`, `src/mcps.js:110`, `src/mcps.js:126`.
- Pattern: Exactly one transport (`command` or HTTPS `url`), optional args/env/headers, rendered per target.

**Managed Block:**
- Purpose: Generated file region that can be updated without deleting human-authored content.
- Examples: `src/utils/managed-block.js`, `src/commands/sync.js:86`, `src/commands/sync.js:97`, `src/commands/sync.js:102`.
- Pattern: Begin/end markers, optional comment prefix for formats such as TOML, replacement on repeat sync.

**Template Root:**
- Purpose: Package-local content source for generated agent files and harness state templates.
- Examples: `src/utils/copy.js:104`, `src/utils/copy.js:122`, `src/commands/harness-init.js:14`, `templates/`.
- Pattern: Resolve from module location rather than process cwd.

## Entry Points

**CLI Binary:**
- Location: `bin/cli.js`
- Triggers: `skogharness` or `harness` package binary.
- Responsibilities: Define commands, options, aliases, and dispatch to command handlers.

**Programmatic Package Entry:**
- Location: `src/index.js`
- Triggers: ESM import of package main.
- Responsibilities: Export command handlers, agent helpers, copy helpers, TOON setup, and profile data.

**Init Command:**
- Location: `src/commands/init.js`
- Triggers: `harness init [dir]` or default CLI invocation.
- Responsibilities: Install selected agent templates and persist manifest-driven configuration.

**Sync Command:**
- Location: `src/commands/sync.js`
- Triggers: `harness sync [dir]`, `init()` after manifest write, `addMcp()`, `addSkill()`.
- Responsibilities: Project resolved manifest state into target-native files.

**Status Command:**
- Location: `src/commands/status.js`
- Triggers: `harness status [dir]`.
- Responsibilities: Detect drift between resolved manifest and native generated files.

**Add Command:**
- Location: `src/commands/add.js`
- Triggers: `harness add mcp <name>` and `harness add skill <name>`.
- Responsibilities: Mutate manifest in narrowly scoped ways and reconcile outputs.

**Harness State Scaffold Command:**
- Location: `src/commands/harness-init.js`
- Triggers: `harness harness-init [dir]`.
- Responsibilities: Write `feature_list.json`, `progress.md`, `session-handoff.md`, and `init.sh` from templates.

**Repository Verification Entrypoint:**
- Location: `init.sh`
- Triggers: Developer workflow.
- Responsibilities: Install dependencies with Bun, run lint/tests, and execute harness validation.

## Architectural Constraints

- **Threading:** Single-process Node.js event loop; filesystem operations are asynchronous in command paths except `src/utils/toon.js`, which performs synchronous local inspection after copy.
- **Global state:** Static registries are module-level constants in `src/agents.js`, `src/profiles.js`, and `src/mcps.js`. CLI parsing uses Commander global `program` in `bin/cli.js`.
- **Circular imports:** No circular dependency chain detected in `src/`; command modules import domain/util modules, and utility modules only import `src/agents.js` or `src/utils/security.js`.
- **Filesystem writes:** All target writes go through `fs/promises` or `fs-extra`; generated writes should continue using `src/utils/copy.js`, `src/utils/managed-block.js`, or command-local helpers that create parent directories as needed.
- **Secrets:** Runtime code never reads `.env` files. It only writes placeholder names to `.env.example` and reports unset environment variable names from manifest placeholders (`src/commands/sync.js:117`).
- **Template safety:** Template copy operations reject symlinks and validate paths before copying skills or commands (`src/utils/copy.js:31`, `src/utils/copy.js:525`).

## Anti-Patterns

### Bypassing `skogai.json` for Generated Configuration

**What happens:** Editing `.claude/`, `.codex/`, `.mcp.json`, `CLAUDE.md`, or `AGENTS.md` generated sections directly creates drift from the manifest contract.
**Why it's wrong:** `harness status` treats drift as an error and `harness sync` overwrites managed sections or managed keys from `skogai.json`.
**Do this instead:** Mutate `skogai.json` through `src/commands/add.js` patterns or `src/manifest.js` validation, then run `runSync()` from `src/commands/sync.js`.

### Writing Whole Mixed-Ownership Files

**What happens:** Replacing an entire root guidance/config file discards user-authored content outside generated sections.
**Why it's wrong:** `CLAUDE.md`, `AGENTS.md`, and `.codex/config.toml` may contain human-authored material that must survive sync.
**Do this instead:** Use `upsertManagedBlock()` from `src/utils/managed-block.js` for formats with comments/markers, or merge by stable keys like `writeMcpServersJson()` in `src/commands/sync.js`.

### Adding Target-Specific Behavior to Shared Registries

**What happens:** Encoding native file format details inside `src/manifest.js`, `src/profiles.js`, or `src/agents.js` couples domain resolution to output rendering.
**Why it's wrong:** Manifest resolution should remain target-neutral; target-specific projections belong in sync/copy paths.
**Do this instead:** Add target-specific rendering near `syncClaude()`/`syncCodex()` in `src/commands/sync.js` or in a dedicated utility referenced from that command.

### Copying Template Paths Without Safety Checks

**What happens:** New copy code builds paths from user-controlled names and calls `copy()`/`writeFile()` directly.
**Why it's wrong:** This bypasses path traversal, symlink, null byte, and log injection protections.
**Do this instead:** Use `normalizeSkillPath()`, `isValidCommandName()`, `isPathSafe()`, `rejectSymlink()`-backed helpers, and `sanitizeForLog()` patterns in `src/utils/copy.js` and `src/utils/security.js`.

## Error Handling

**Strategy:** Validate early, throw errors from reusable helpers, catch at CLI command boundaries, print concise colored messages, and exit non-zero for failed commands or detected drift.

**Patterns:**
- Reusable functions throw `Error` with actionable messages (`src/manifest.js:17`, `src/mcps.js:43`, `src/utils/copy.js:25`).
- CLI command wrappers catch errors, print a `chalk.red()` message, and call `process.exit(1)` (`src/commands/init.js:239`, `src/commands/sync.js:173`, `src/commands/add.js:57`).
- Status uses `process.exitCode = 1` for drift while still printing the full report (`src/commands/status.js:116`).
- JSON parsing errors wrap the original message and include the file path (`src/manifest.js:64`, `src/commands/sync.js:26`).
- Managed block corruption throws and instructs users to remove stray markers (`src/utils/managed-block.js:39`).

## Cross-Cutting Concerns

**Logging:** Use `console.log()`/`console.error()` with `chalk` for CLI output in `src/commands/`; sanitize user-derived path/name fragments with `sanitizeForLog()` in lower-level utilities.
**Validation:** Validate manifests in `src/manifest.js`, MCP entries in `src/mcps.js`, targets in `src/agents.js`, paths/command names in `src/utils/security.js`, and template file types in `src/utils/copy.js`.
**Authentication:** Not applicable to the CLI runtime. MCP credentials are represented by environment variable placeholders such as `${GITHUB_PERSONAL_ACCESS_TOKEN}` in `src/mcps.js`; real secrets stay outside repo files.

---

*Architecture analysis: 2026-07-08*
