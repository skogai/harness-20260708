# Environment: remote-anthropic

The Anthropic-managed Claude Code remote environment (claude.ai/code sessions).
An isolated, ephemeral container: the repo is cloned fresh at session start and
the container is reclaimed after inactivity, so anything worth keeping must be
committed and pushed.

Identified by `SKOGAI_ENVIRONMENT=remote`.

## SkogAI environment variables

| Variable | Value |
| --- | --- |
| `SKOGAI_MODE` | `cloud` |
| `SKOGAI_ENVIRONMENT` | `remote` |
| `SKOGAI_CONFIG` | `.skogai` |
| `SKOGAI_CONFIG_DIR` | `.skogai` |
| `SKOGAI_SCRIPTS_USER_DIR` | `./scripts` |
| `SKOGAI_SCRIPTS_GLOBAL_DIR` | `.skogai/scripts` |

## System

| | |
| --- | --- |
| OS | Ubuntu 24.04 LTS (kernel 6.18.5, x86_64) |
| Working directory | `/home/user/harness` |
| User | root |
| Disk | shared rootfs (~252 GB device), but writable space is a fixed per-session allowance |

## Tooling

| Tool | Version | Notes |
| --- | --- | --- |
| skogcli | v0.0.3 | `/root/.local/bin/skogcli`; commands: `version`, `memory`, `config`, `script`, `agent` |
| node | v22.22.2 | system install |
| bun | 1.3.11 | system install |
| python3 | 3.11.15 | system install |
| uv | 0.8.17 | |
| git | 2.43.0 | |
| mise | **not installed** | |
| gh | **not installed** | GitHub access goes through MCP tools instead |

### mise.toml is not in effect here

The repo pins tools via `mise.toml` (node 26, bun 1.3.14, python 3.14), but
mise is not installed in this environment, so the system versions above are
what actually runs. The `.venv` auto-activation and `mise run` tasks
(`test`, `test:py`, `check`, …) are likewise unavailable unless mise is
installed first; run the underlying commands directly (`node --test`,
`python3 -m unittest discover -p 'test_*.py'` in `scripts/`).

## Network

- Outbound HTTPS is routed through a local agent proxy
  (`HTTPS_PROXY=http://127.0.0.1:42105`, CA bundle at
  `/root/.ccr/ca-bundle.crt`). Do not disable TLS verification or unset the
  proxy; see `/root/.ccr/README.md` when a tool fails TLS or gets 403/405/407.
- Common package registries (npmjs, PyPI, crates.io, proxy.golang.org, jsr.io)
  bypass the proxy via `NO_PROXY`.
- Reachability beyond that depends on the environment's network policy chosen
  at environment creation.

## GitHub

- No `gh` CLI and no direct API access — all GitHub operations (PRs, issues,
  CI status) go through the GitHub MCP server tools.
- Repository scope is limited to what the session was started with
  (currently `skogai/harness`); other repos must be added explicitly.
- Work happens on session-specific `claude/…` branches, pushed with
  `git push -u origin <branch>`, followed by a draft PR.

## Quirks

- `df` misleads here: "Avail 0" with low "Used" means the per-session write
  allowance is spent, not a broken disk. Deleting large files frees
  immediately writable space.
- Chromium is pre-installed for Playwright
  (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`); never run
  `playwright install`.
