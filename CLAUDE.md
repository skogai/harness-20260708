# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Claude-specific notes

- `templates/` is a full self-referential copy of this repo's own scaffold (its own `src/`, `test/`, `AGENTS.md`, `.claude/`) used to bootstrap new harness installs. Edits under `templates/src/...` are template content, not this repo's runtime code — don't confuse the two trees.
- Package manager is `bun` (`bun@1.3.11` per `packageManager` in package.json). Prefer `bun install` / `bun test` / `bun run lint` over `npm`/direct `node` invocations where both work.
- This repo is actively being stripped down toward a "skogai agent runtime" (git log shows removal of Cursor support, legal/security docs, and most of an aspirational 40-skill marketplace — only `toon-formatter` and `harness-creator` skills remain live under `templates/.claude/skills/`). Don't assume README/marketplace copy describing "40 skills across 10 categories" (`.claude-plugin/README.md`) reflects current reality — it's stale/aspirational.
