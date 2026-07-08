# Technology Stack

**Analysis Date:** 2026-07-08

## Languages

**Primary:**
- JavaScript (Node.js ESM) - Runtime source in `src/`, CLI entry point in `bin/cli.js`, and tests in `test/`. `package.json` sets `"type": "module"`, so use ESM imports with explicit `.js` extensions for project modules.

**Secondary:**
- Bash - Local install and verification scripts in `scripts/install-global.sh` and `init.sh`; Claude hook templates in `templates/.claude/hooks/*.sh`.
- Markdown - User and agent-facing documentation in `README.md`, `AGENTS.md`, `docs/*.md`, `templates/blocks/*.md`, `templates/.claude/commands/*.md`, and template skill docs under `templates/.claude/skills/`.
- JSON - Package metadata in `package.json`, plugin metadata in `.claude-plugin/marketplace.json`, lifecycle state in `feature_list.json`, and generated target manifests such as `skogai.json` handled by `src/manifest.js`.
- MJS JavaScript - Template utilities in `templates/.claude/utils/toon/cli.mjs` and harness-creator scripts in `templates/.claude/skills/harness-creator/scripts/*.mjs`.

## Runtime

**Environment:**
- Node.js `>=18.0.0` - Declared in `package.json` `engines.node`; the executable shebang in `bin/cli.js` is `#!/usr/bin/env node`.
- Bun `1.3.11` - Preferred development package manager via `package.json` `packageManager` and `bun.lock`.

**Package Manager:**
- Bun `1.3.11` - Use `bun install`, `bun run lint`, and `bun test` for normal development (`package.json`, `AGENTS.md`, `init.sh`).
- npm - Supported for package execution/linking and fallback paths: `npx skogharness@latest`, `npm test`, `npm link`, and fallback `npm install --no-package-lock` in `scripts/install-global.sh`.
- Lockfile: `bun.lock` present; no `package-lock.json` detected.

## Frameworks

**Core:**
- Commander `15.0.0` - CLI command routing in `bin/cli.js`; commands include `init`, `harness-init`, `sync`, `status`, `add mcp`, and `add skill`.
- Node.js standard library - Filesystem, path, URL, child process, and test modules are used across `src/`, `bin/cli.js`, `test/`, and template scripts.

**Testing:**
- Node built-in test runner - `package.json` runs `node --test`; test files in `test/*.test.js` import `node:test` and `node:assert/strict`.
- `test:security` - `package.json` runs `node --test test/*.test.js` as the focused security-related suite.

**Build/Dev:**
- ESLint `10.4.1` with `@eslint/js` `10.0.1` - Configured in `eslint.config.js`; lint target is `src/`, `test/`, `bin/`, and `templates/.claude/utils/`.
- No transpiler/bundler detected - Runtime files execute directly as ESM JavaScript.
- `prepublishOnly` - `package.json` runs `bun run lint && bun test` before publishing.

## Key Dependencies

**Critical:**
- `commander` `15.0.0` - Defines the CLI surface in `bin/cli.js`.
- `fs-extra` `11.3.3` - Provides higher-level filesystem helpers used by install/sync/copy flows in `src/commands/*.js` and `src/utils/copy.js`.
- `chalk` `5.6.2` - Terminal output styling in `src/commands/init.js`, `src/commands/add.js`, `src/commands/status.js`, and `src/commands/sync.js`.
- `inquirer` `14.0.2` - Interactive prompts during `harness init` in `src/commands/init.js`.
- `ora` `9.4.0` - Spinner feedback during install/scaffold flows in `src/commands/init.js` and `src/commands/harness-init.js`.

**Infrastructure:**
- `@toon-format/toon` `2.1.0` - TOON encode/decode support for template utility `templates/.claude/utils/toon/cli.mjs`.
- `gpt-tokenizer` `3.0.0` - Token counting helper loaded dynamically by `templates/.claude/utils/toon/cli.mjs`.
- `@eslint/js` `10.0.1` - ESLint recommended config imported by `eslint.config.js`.
- MCP server packages are invoked as external `npx` commands rather than installed package dependencies: `@modelcontextprotocol/server-github`, `@neondatabase/mcp-server-neon`, `@stripe/mcp`, and `mcp-send-email` in `src/mcps.js`.

## Configuration

**Environment:**
- Project configuration source of truth is `skogai.json`, loaded and validated by `src/manifest.js` and written by `src/commands/init.js` / `src/commands/add.js`.
- Agent targets are configured through generated native files: Claude `.mcp.json` and `.claude/`, Codex `.codex/config.toml` and `AGENTS.md` (`src/commands/sync.js`, `src/commands/status.js`).
- Environment variables are referenced by placeholder names in MCP definitions and documented into `.env.example` by `src/commands/sync.js`; no `.env` files detected in the repo root.
- Required MCP env placeholder names currently supported by the built-in catalog: `GITHUB_PERSONAL_ACCESS_TOKEN`, `NEON_API_KEY`, `STRIPE_SECRET_KEY`, and `RESEND_API_KEY` (`src/mcps.js`).

**Build:**
- `package.json` - Package metadata, bin aliases, scripts, dependencies, engine requirement, and Bun package manager version.
- `bun.lock` - Dependency lockfile.
- `eslint.config.js` - Flat ESLint config; ignores `.agents/**`, `node_modules/**`, and `site/**`.
- `.claude-plugin/marketplace.json` - Claude plugin marketplace metadata for shipped skills under `templates/.claude/skills/`.
- `init.sh` - Full local verification entrypoint: `bun install`, `bun run lint`, `bun test`, and harness validation script.

## Platform Requirements

**Development:**
- Node.js `>=18.0.0` and Bun `1.3.11` preferred (`package.json`, `init.sh`).
- npm must be available for global linking via `scripts/install-global.sh`; Bun is preferred for dependency install and npm is used for `npm link`.
- POSIX shell environment for `init.sh`, `scripts/install-global.sh`, and shell hook templates in `templates/.claude/hooks/`.

**Production:**
- Distributed as an npm CLI package named `skogharness` with binaries `skogharness` and `harness` mapped to `bin/cli.js` (`package.json`).
- Runtime deployment target is any Node.js environment satisfying `>=18.0.0`; no server hosting platform or long-running web service detected.
- Plugin distribution metadata is stored in `.claude-plugin/marketplace.json` and points at local templates under `templates/.claude/skills/`.

---

*Stack analysis: 2026-07-08*
