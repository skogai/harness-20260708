# Environment: remote-control

Notes on the environment this Claude Code session runs in when invoked via
remote control (non-interactive harness session, not a local terminal).

## Session

- Working directory: `~/harness/.claude/worktrees/bridge-cse_01KbvZu8TxWf78WcDVKhFnY6`
  (a `wt`/git worktree off the main `~/harness` checkout, branch
  `worktree-bridge-cse_01KbvZu8TxWf78WcDVKhFnY6`)
- Non-interactive: OAuth/device-code flows for MCP servers (e.g.
  `Claude_Code_Remote`, `smithery`) cannot be completed here; those servers
  must be authorized ahead of time via `claude mcp` / `/mcp` or the claude.ai
  connector settings.

## SkogAI

- `SKOGAI_CONFIG_DIR=/home/skogix/skogai/config`
- `SKOGAI_CONFIG=/home/skogix/skogai/config`
- `skogcli` is installed at `/home/skogix/.local/bin/skogcli`, version
  **v0.0.3** (`skogcli version`; there is no `--version` flag on the root
  command).
- `skogcli` subcommands: `version`, `memory`, `config`, `script`, `agent`.
  Config is a flat dotted key/value store (`skogcli config list|get|set`),
  mixing SkogAI notation primitives (`$.*`, `$.eid`, ...) with per-agent
  env blocks like `amy.env.*`, `claude.env.*`, `ansible.env.*`.
- `.skogai/scripts/env.sh` wraps `skogcli config get "$1.env.$2" --raw` to
  read an agent's env var from that store.
- `.skogai/scripts/claude-code-init.sh` installs/upgrades skogcli itself via
  `uv tool install git+https://github.com/skogai/cli.git --force --upgrade`.

## Repo layout (this worktree)

- `CLAUDE.md` / `SKOGAI.md` — router files pointing at `skogai.json` (not
  present in this worktree yet) and `.skogai/SKOGAI.md`.
- `.docs/` — consolidated harness documentation (concepts, patterns,
  archive of the previous harness generation). This is distinct from
  `docs/` (this directory), which is new.
- `schemas/` — JSON Schemas for the SkogAI notation types (agent, decision,
  pattern, principle, skill, workflow, etc.).
- `plugins/skoghooks/` — hook plugin(s).
- `scripts/date.sh` — small helper script.
- No `.venv/` in this worktree (present in the main `~/harness` checkout).

## Toolchain (declared in `mise.toml`)

- node 26, bun 1.3.14, python 3.14, uv latest, usage latest
- `.python-version` pins `3.13` locally (differs from mise's `3.14`)
- Tasks: `mise run check` (node + python tests), `check:skills`,
  `check:schema`, `install-skogcli`

## Verified tool availability

- `git`, `skogcli`, `uv`, `python3` (via harness `.venv`), `node` all resolve
  on `PATH`.
