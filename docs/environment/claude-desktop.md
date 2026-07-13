# Environment: claude-desktop

Claude Desktop running in **local agent mode**, driving the harness repo on the local
workstation. Documented 2026-07-13, verified live from inside a running session.

## Identity

| | |
|---|---|
| Environment name | `claude-desktop` |
| Runtime | Claude Desktop → local agent mode → Claude Code runtime |
| Claude Code version | `2.1.202` (`~/.config/Claude/claude-code/2.1.202/claude`, via `CLAUDE_CODE_EXECPATH`) |
| Model | `claude-fable-5` (Fable 5) |

## Host

- Hostname: `skogix-workstation`
- OS: Arch Linux, kernel `7.1.3-arch1-2`, x86_64
- User: `skogix` (`emil@skogsund.se`)
- Working directory: `/home/skogix/harness` (git repo, branch `master`)

## Shell behavior

- Shell: zsh. Every Bash tool call runs in a **fresh, non-persistent shell**
  initialized from the user profile — exported variables and `cd` do not survive
  between calls.
- **direnv is installed but does not load `.envrc` in this environment.**
  The `.envrc` is found and allowed (`direnv status`: "Found RC allowed 0"), but
  the direnv shell hook never fires in these non-interactive shells, so it reports
  "No .envrc or .env loaded". Consequently the variables defined in
  [.envrc](../../.envrc) —
  `SKOGAI_CONFIG_DIR` and `SKOGAI_CONFIG` — are **not set** in agent sessions.
  Commands that need them must export them explicitly, e.g.:

  ```sh
  SKOGAI_CONFIG_DIR=.skogai/config SKOGAI_CONFIG=.skogai/config <cmd>
  # or
  direnv exec /home/skogix/harness <cmd>
  ```

## Toolchain

mise shims are on PATH, so the tools pinned in [mise.toml](../../mise.toml) resolve
correctly despite `.envrc` not loading:

| Tool | Version |
|---|---|
| node | v26.5.0 |
| bun | 1.3.14 |
| python | 3.14.6 (project `.venv`) |
| uv | 0.11.28 |

## SkogAI tooling

- `skogcli` **v0.0.3** at `~/.local/bin/skogcli` (installed via
  `uv tool install git+https://github.com/skogai/cli`).
- Subcommands: `version`, `memory`, `config`, `script`, `agent`.
- The version flag is the `skogcli version` subcommand — `skogcli --version` errors.

## Harness extras available in this environment

- Claude Code plugins on PATH: skoghooks, worktrunk, pyright-lsp, typescript-lsp.
- CodeGraph index present: `.codegraph` →
  `~/.omo/codegraph/projects/harness-c7fa44deda9e0dd8` (MCP tools + `codegraph` CLI).
- MCP servers connected: session tools (chapters/tasks), Claude Preview, visualize
  widgets, a GitHub/Notion/Cloudflare toolbox, claude-in-chrome, codegraph,
  scheduled-tasks, mcp-registry.

## Known gaps / quirks

- `SKOGAI_*` environment variables are unset (see [Shell behavior](#shell-behavior)).
- [SKOGAI.md](../../SKOGAI.md) routes reference `skogai.json` and
  `.skogai/SKOGAI.md`; neither file exists on disk yet.
