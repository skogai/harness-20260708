# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-10
**Commit:** 4b3c0a0
**Branch:** opencode/brave-engine

## OVERVIEW

`skogharness` is a Node 18+ ESM package for declaratively configuring and synchronizing agent harnesses. Root runtime code is in `src-js/`; the repository also ships agent/skill content, JSON Schemas, validator scripts, and argc tooling.

## READ FIRST

1. Read this file, then the closest nested `AGENTS.md`.
2. `CLAUDE.md` routes to `SKOGAI.md`; `SKOGAI.md` identifies `skogai.json` and `.skogai/` as harness configuration context.
3. Do not treat `.skogai/` mirrors, `.skogix/`, `.old/`, `.omo/`, `.claude/`, `.mcp.json`, or `tmp/` as primary implementation surfaces. The tracked `mcp.json` is the MCP bridge source; `.mcp.json` is local client configuration.

## STRUCTURE

```text
brave-engine/
├── src-js/       # package API, manifest model, sync/install commands
├── scripts/      # repository validators and their colocated tests
├── schemas/      # JSON Schema contracts for documents and manifests
├── agents/       # symlinked shipped-agent view; some leaf packages own rules
├── skills/       # skill packages, each rooted at SKILL.md
├── argc/         # argc command/tool ecosystem and MCP bridges
├── tools/        # source tool implementations
├── templates/    # materialized harness templates
├── bin/          # generated executable wrappers
├── functions.json # generated tool declarations
└── mcp.json       # MCP bridge configuration
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Public API / install | `src-js/index.js`, `src-js/commands/` | `init()` installs; `runSync()` reconciles generated state. |
| Manifest behavior | `src-js/manifest.js`, `src-js/mcps.js` | `skogai.json` validation and MCP payload construction. |
| File materialization | `src-js/utils/copy.js`, `src-js/utils/managed-block.js` | Copying is deliberately conservative. |
| Validation policy | `scripts/` | Validators use colocated `test_*.py` tests. |
| Document contracts | `schemas/` | See `schemas/AGENTS.md` before changing type/schema mappings. |
| Agent packages | `agents/` | Existing leaf rules in `librarian/` and `git-flow/` take precedence. |
| argc commands | `Argcfile.sh`, `argc/` | `Argcfile.sh` owns build/check/test command definitions. |

## CODE MAP

| Symbol / file | Role |
|---|---|
| `init()` — `src-js/commands/init.js` | Installs harness material and begins synchronization. |
| `runSync()` — `src-js/commands/sync.js` | Resolves a manifest and updates target-agent state. |
| `harnessInit()` — `src-js/commands/harness-init.js` | Creates harness state files. |
| `addMcp()` / `addSkill()` — `src-js/commands/add.js` | Mutate `skogai.json`, then synchronize. |
| `getStatus()` — `src-js/commands/status.js` | Reports installation drift. |
| `loadManifest()` / `resolveManifest()` — `src-js/manifest.js` | Manifest load, validation, and resolution boundary. |
| `copyAgentEssentials()` / `copyAgentSkills()` — `src-js/utils/copy.js` | Target-agent file materialization. |

## CONVENTIONS

- Root JS is ESM; use explicit `.js` imports and named exports.
- Main JS follows guard clauses, two-space indentation, and semicolons. Preserve local quote style when editing.
- Skill folders are kebab-case; `SKILL.md` content must remain English-only.
- Public skill/reference text must remain neutral: no local absolute paths, concrete URLs, or source-project leakage.
- `Argcfile.sh` commands use argc metadata (`# @cmd`, `# @option`, `# @arg`) and `argc_*` variables.

## ANTI-PATTERNS (THIS PROJECT)

- Do not edit generated `bin/` wrappers by hand; edit their source/generator inputs.
- Do not edit through the `agents/` symlink in this checkout; it resolves outside the tracked worktree.
- Do not create a duplicate source of truth beneath `.skogai/`; it mirrors harness content.
- Do not follow symlinks or overwrite existing target content without the explicit `--force` / `--merge` paths used by copy logic.
- MCP definitions must be exactly one of a stdio `command` or an HTTPS `url`; duplicate MCP names are invalid.
- Keep `.claude/settings.json` user-owned during sync changes.
- Treat `.list` content as append-only and order-sensitive.

## COMMANDS

```bash
bun run test                 # node --test
bun run test:security        # Node tests in test/*.test.js
bun run install:global       # install/link the package globally
./scripts/validate-schema.sh # validate eligible docs against schemas
argc build                   # build configured tools and agents
argc test                    # exercise configured argc tools and agents
```

## NOTES

- `prepublishOnly` invokes `bun run lint`, but the root `package.json` has no `lint` script. Do not use it as a green validation signal without addressing that mismatch.
- There is no tracked `.github/workflows/` CI configuration in this checkout.
- Root `package.json` advertises `bin/cli.js`, but that file is absent; checked-in `bin/` entries are generated wrappers.
