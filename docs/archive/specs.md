# Project specs

Baseline technical facts about `skogharness`. This is the quick-reference
sibling to [`implementation.md`](./implementation.md) (design rationale) and
[`features.md`](./features.md) (feature status) — keep it in sync when specs
change, but don't duplicate rationale here.

## Identity

- **Package name:** `skogharness`, v4.0.0, MIT license.
- **Purpose:** declarative agent config for Claude Code and Codex — a
  `skogai.json` manifest for skills, MCP servers, and stack profiles, synced
  to each agent's native config, plus hand-maintained skills.
- **Binaries:** `skogharness` and `harness`, both resolving to `bin/cli.js`.

## Runtime

- **Language/module system:** Node.js ESM (`"type": "module"`), explicit
  `.js` import extensions required.
- **Minimum Node version:** `>=18.0.0` (`engines.node`).
- **Package manager:** `bun@1.3.11` (`bun.lock` committed); `npm`/plain
  `node` also work for install and test since the test runner is `node --test`.
- **CLI framework:** `commander`.
- **Runtime dependencies:** `chalk`, `commander`, `fs-extra`, `inquirer`,
  `ora`.
- **Dev dependencies:** `eslint`, `@eslint/js`, `@toon-format/toon`,
  `gpt-tokenizer`.

## Structure

- `bin/cli.js` — executable entry point, command registration.
- `src/commands/` — one file per CLI command (`init`, `sync`, `status`,
  `add`, `harness-init`).
- `src/manifest.js`, `src/agents.js`, `src/mcps.js`, `src/profiles.js` —
  manifest schema/resolution and supported targets/catalogs/profiles.
- `src/utils/` — shared helpers (`copy.js`, `managed-block.js`,
  `security.js`, `toon.js`).
- `templates/` — files copied into initialized projects, including a
  self-referential copy of this repo's own scaffold (its own `src/`, `test/`,
  `AGENTS.md`, `.claude/`) used to bootstrap new harness installs. Template
  content under `templates/src/...` is not this repo's runtime code.
- `.claude-plugin/` — plugin marketplace metadata (`marketplace.json`).
- `test/` — `node:test` suites, `*.test.js` naming.
- `docs/` — durable implementation/maintenance notes (this file and its
  siblings); kept separate from the top-level `README.md`, which stays
  focused on install/usage.

## Commands and scripts

- `bun install` — install dependencies from `bun.lock`.
- `bun run lint` / `npm run lint` — ESLint over `src/`, `test/`, `bin/`,
  `templates/.claude/utils/`.
- `bun test` / `npm test` — full suite via `node --test`.
- `bun run test:security` — focused security tests (`test/*.test.js`
  matching security scope).
- `bun run install:global` — runs `scripts/install-global.sh`.
- `prepublishOnly` — runs lint then test before publish.

## Coding conventions

- Two-space indentation, single quotes, semicolons.
- Named exports for public helpers; explicit `.js` extensions on imports.
- Unused function arguments are allowed only when prefixed with `_`
  (ESLint-enforced).
- Commit style: short imperative subjects, Conventional Commit prefixes
  (`feat:`, `docs:`, `fix:`, etc.) where applicable.

## Security boundaries

- No committed secrets, tokens, or local agent credentials.
- Generated MCP/env examples use placeholder values
  (e.g. `${GITHUB_PERSONAL_ACCESS_TOKEN}`); real values stay in local,
  ignored files.
- `src/utils/security.js` validates paths, skill paths, and command names,
  and sanitizes logs — this is the enforcement point for the boundary above.
