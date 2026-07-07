# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

**skogai/harness** (npm: `skogharness`, bin: `harness`/`skogharness`) is a small, depth-focused multi-agent skill pack and project-level agent config manager — a hard fork of `agent-starter` adapted to fit the skogai workflow. It ships one shared set of hand-written skills and generates native project files for three agent targets:

- Claude Code: `.claude/` (skills, settings, TOON slash commands, optional hooks)
- Codex: root `AGENTS.md` plus `.codex/skills/<skill-id>/SKILL.md`
- Cursor: `.cursor/rules/*.mdc`

Users run `npx skogharness@latest` and choose targets with `--agent claude|codex|cursor|all`.

This is configuration, not an app framework. Avoid adding runtime orchestration, semantic matching engines, YAML workflow DSLs, or placeholder command frameworks. See SPEC.md for the full v4 manifest design.

## Commands

```bash
npm test                                 # all tests (node --test over test/*.test.js)
node --test test/manifest-sync.test.js   # single test file
node --test --test-name-pattern="drift"  # filter tests by name
npm run lint                             # eslint over src/ test/ bin/ bench/ templates/.claude/utils/

bun run bench                            # rewrite bench/RESULTS.md + results.json; enforces a 40% aggregate savings gate
bun run bench:generate                   # deterministically regenerate bench workloads
```

The marketing site is a separate Next.js app in `site/` with its own lockfile:

```bash
cd site && bun install && bun run lint && bun run typecheck && bun run build
```

CI (`.github/workflows/ci.yml`) uses Bun 1.3.11 (`bun install --frozen-lockfile`, `bun run lint`, `bun test`, `bun audit`, site checks, gitleaks, CodeQL). npm works fine for local root scripts; `packageManager` is pinned to bun.

To exercise the CLI end-to-end, run it against a temp directory:

```bash
node bin/cli.js init /tmp/demo --agent all --profile all -y
node bin/cli.js sync /tmp/demo
node bin/cli.js status /tmp/demo        # exits 1 on drift
```

## Architecture

**CLI entry**: `bin/cli.js` (commander) dispatches to `src/commands/{init,sync,status,add}.js`; `init` is the default command. `src/index.js` re-exports the programmatic API. Bin names are `harness` and `skogharness`; no legacy `agent-starter`/`claude-starter` aliases are carried over from upstream.

**One skill source, generated targets**: The canonical skill source is `templates/.claude/skills/<skill>/skill.md` (or `SKILL.md`). `src/utils/copy.js` is the adapter layer that generates the other targets at install time: it parses frontmatter, normalizes descriptions ("Claude needs" → "the agent needs"), writes Codex `SKILL.md` files plus a generated root `AGENTS.md` skill index, and flattens skill paths into Cursor rule names (`/` → `--`) while rewriting `references/` links. Never hand-maintain per-agent copies of a skill.

**Manifest flow (v4)**: A `skogai.json` manifest at a project root declares `version`, `profile`, `targets`, `skills`, and `mcps`. `src/manifest.js` loads/validates it and resolves it against:

- `src/profiles.js` — the skill registry (`SKILLS`) and profiles, including stack profiles (`next-saas`, `next`, `node`, `base`) auto-detected from the project's package.json dependencies.
- `src/mcps.js` — the MCP catalog (github, neon, stripe, resend) and per-target config rendering: `.mcp.json` (Claude), `.codex/config.toml`, `.cursor/mcp.json`. Secrets stay as `${VAR}` references, never resolved into generated files.

`sync` writes each target's native config idempotently: generated sections in CLAUDE.md/AGENTS.md go through `src/utils/managed-block.js` fenced `<harness:generated>` tags (edits outside them survive), and `mcpServers` JSON is merged by key so entries harness didn't write are never touched. `status` diffs skogai.json against native configs.

**Security invariants**: `src/utils/security.js` and `copy.js` enforce path-traversal-safe skill/command paths, symlink rejection on every template copy, and staged-then-swap replacement of `.claude/` with backup/rollback. `test/security-hardening.test.js` covers these guarantees — preserve them when touching install/copy code.

## Skills

Shipped skills are registered in `src/profiles.js`. Current groups:

- HCI usability modeling: `human-processor-model`, `goms-klm-analysis`
- Apple HIG Doctor and reference skills: `hig-*` (vendored from HIG Doctor, with progressive-disclosure `references/` corpora)
- Cleanup skills: `cleanup-*`
- Workflow/growth/utility skills: `finish-setup`, `copywriting-frameworks`, `toon-formatter`

When adding a skill: add the shared source in `templates/.claude/skills/`, register it in `src/profiles.js` (and any profiles that should include it), add regression coverage for all relevant agent targets, and update README/site copy. `test/skill-quality.test.js` enforces quality gates on skill files, including a 500-line cap on skill entrypoints — put depth in `references/` files.

## Agent Target Rules

- Claude output owns `.claude/`: settings generation, commands, hooks, and TOON utility setup.
- Codex output owns `.codex/skills/*/SKILL.md` and root `AGENTS.md`.
- Cursor output owns `.cursor/rules/*.mdc`.
- Keep Claude as the default install target for backwards compatibility.

## Testing

Tests use `node:test` and install into temp directories, including exec'ing the real CLI. The important invariant: a selected skill set installs cleanly into every requested agent target without emitting unrelated target directories. Before calling installer work done, verify Codex and Cursor installs with real CLI output in a temp directory, not just helper-level tests.
