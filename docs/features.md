# Features: have, need, want

This tracks the feature surface of `skogharness` at three horizons: what is
implemented today, what is missing to make the current design complete, and
what is deliberately out of scope or aspirational. Update this file when a
feature moves between sections — don't let it drift from `feature_list.json`
(session-level tracker) or `docs/implementation.md` (design rationale).

## Have

Core manifest CLI (`skogai.json` -> native agent config):

- `harness init [dir]` (default command) — creates/updates `skogai.json`,
  installs template files (skills, hooks, commands, TOON utils), then runs
  sync. Options: `-y/--yes`, `-f/--force`, `--agent <claude|codex|all>`,
  `--profile <name>`, `--skills <list>`, `--no-toon`.
- `harness sync [dir]` — resolves the manifest (`src/manifest.js`,
  `src/mcps.js`) and writes native config: `.mcp.json`, Claude skills/settings
  managed blocks, Codex TOML/`AGENTS.md` blocks.
- `harness status [dir]` — diffs the manifest against native config and exits
  non-zero on drift.
- `harness add mcp <name>` / `harness add skill <name>` — mutates the manifest
  (MCP catalog entry or custom `--command`/`--url`/`--env`/`--header`; skill
  from the maintained skill set) then re-syncs.
- `harness harness-init [dir]` — scaffolds a lifecycle-state kit
  (`feature_list.json`, `progress.md`, `session-handoff.md`, `init.sh`) with
  package-manager and verification-command auto-detection, sourced from the
  `harness-creator` skill templates. Wired into `bin/cli.js` and
  `src/index.js`; not yet documented in the top-level README or covered by a
  test (see Need).

Supporting modules: `src/manifest.js` (load/validate/resolve `skogai.json`),
`src/agents.js` (targets: `claude`, `codex`, `all`), `src/mcps.js` (MCP
catalog, TOML/JSON builders, env-var collection), `src/profiles.js` (preset
profiles: `all`/`minimal`/`custom`).

Shared utilities (`src/utils/`): `security.js` (path traversal / skill-path /
command-name validation, log sanitizing), `managed-block.js` (idempotent
managed-block upsert for generated files), `copy.js` (file-copy engine for
agent essentials, skills, commands, hooks, TOON utils; rejects symlinks),
`toon.js` (installs the TOON CLI wrapper at `.claude/utils/toon`).

Shipped skills and templates: `toon-formatter` and `harness-creator` (the only
two live Claude Code skills), plus Claude hook templates (secret-scanner,
file-size-monitor, markdown-formatter, settings-backup, toon-validator),
slash-command templates (toon-encode/decode/validate, analyze-tokens,
convert-to-toon), and a minimal `templates/codex/README.md`.

Plugin marketplace: `.claude-plugin/marketplace.json` declares exactly the two
live skills above — this now matches reality (previously advertised "40
skills across 10 categories," corrected in an earlier pass).

## Need

Gaps that block the current design from being complete on its own terms —
not new scope, just finishing what's already started:

- **Document `harness harness-init` in the top-level README.** It's wired
  into the CLI and covered in `docs/implementation.md` conceptually, but the
  `README.md` usage block doesn't mention it, so users of the CLI won't
  discover it.
- **Test coverage for `harness-init`.** `test/` has no file exercising
  `src/commands/harness-init.js` (auto-detection of package manager and
  verification commands, force-overwrite behavior, file scaffolding). Every
  other command (`init`, `sync`, `status`, `add`) has corresponding coverage
  under `install-regression.test.js` / `manifest-sync.test.js`.
- **Final verification pass for the in-progress docs/lifecycle work.**
  `feature_list.json` (feat-003, "Final verification") is `not-started`:
  running `bun run lint`, `bun test`, and the harness-creator validation
  script (`node templates/.claude/skills/harness-creator/scripts/validate-harness.mjs --target .`)
  against the current branch state hasn't happened yet.
- **Reconcile pre-existing uncommitted code changes** (`bin/cli.js`,
  `src/index.js`, `src/commands/harness-init.js`) with a real commit — they've
  been sitting staged/modified across sessions per `progress.md` and
  `session-handoff.md`.

## Want

Explicitly out of current scope, or directional rather than committed:

- **Broader "skogai agent runtime" direction.** `CLAUDE.md` states the repo
  is moving toward being a skogai agent runtime; git history shows removal of
  Cursor support, legacy security/legal docs, and most of an earlier
  40-skill marketplace vision. No concrete plan exists yet for what runtime
  features that implies beyond the current manifest CLI — treat this as
  direction, not a backlog.
- **The retired 40-skill/10-category marketplace vision.** Deliberately
  abandoned, not a gap — noted here only so it isn't mistaken for missing
  work. Only `toon-formatter` and `harness-creator` are maintained; don't
  restore old skills without a fresh justification.
- **Multi-package-manager parity beyond auto-detection.** `harness-init`
  detects `npm`/`pnpm`/`yarn`/`bun`, but the rest of the CLI's own tooling
  (lint/test scripts, install docs) is bun-first. Full parity across package
  managers for harness's own development flow is not a stated goal today.
