---
type: reference
permalink: harness/skogai/environment
---

# The three environments

Same question ("what environment am I running in?") asked in three different
Claude Code surfaces against this repo, answered by inspecting each session
live. The per-environment findings are in sibling files; this page is the
map between them and Anthropic's own terminology (see
`/tmp/claude-code-documentation/remote-control.md` and `desktop.md`).

| Doc | `SKOGAI_ENVIRONMENT` | Official surface | Where it runs |
| --- | --- | --- | --- |
| [remote-control.md](remote-control.md) | (not set / local) | [Remote Control](https://code.claude.com/docs/en/remote-control), `--spawn worktree` mode | **Your machine** (`skogix-workstation`), in a git worktree under `~/harness/.claude/worktrees/` |
| [remote-anthropic.md](remote-anthropic.md) | `remote` | [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) (claude.ai/code cloud session) | **Anthropic-managed container**, cloned fresh, reclaimed after inactivity |
| [claude-desktop.md](claude-desktop.md) | (not set) | [Desktop app](https://code.claude.com/docs/en/desktop), Code tab, **Local** environment | **Your machine**, driven from the Desktop app's Code tab instead of a terminal |

## How to tell them apart from inside a session

1. **Check `SKOGAI_ENVIRONMENT`.** Only the Anthropic-hosted cloud sessions
   set it to `remote` (see [remote-anthropic.md](remote-anthropic.md)). Local
   and Desktop sessions don't set it at all — the harness's `.envrc` doesn't
   run there (Remote Control uses the checked-out repo directly; Desktop's
   non-interactive shells don't fire the direnv hook, see
   [claude-desktop.md](claude-desktop.md#shell-behavior)).
2. **Check the working directory and hostname.** `remote-anthropic` reports
   `/home/user/harness` as `root` on Ubuntu — never true on skogix's own
   machine. `remote-control` and `claude-desktop` both report
   `skogix-workstation` and paths under `/home/skogix/harness`.
3. **Check whether you're in a worktree.** `remote-control` sessions (server
   mode with `--spawn worktree`, the harness's default) run from
   `~/harness/.claude/worktrees/<name>`, on a branch named
   `worktree-bridge-<claude-session-id>`. `claude-desktop` sessions run
   directly in `~/harness` on `master` (or whatever the Desktop pane has
   checked out) unless Desktop's own worktree isolation is in play.
4. **Check the branch a PR landed on.** `claude/harness-remote-anthropic-*`
   branch names come from cloud sessions pushing their own branch on exit;
   `worktree-bridge-*` branch names come from local Remote Control worktree
   sessions. Both patterns show up in `git log` on this repo (e.g. PR #24 vs
   PR #26).

## Setting `SKOGAI_*` vars per environment

`.envrc` at the repo root (`export SKOGAI_CONFIG_DIR=".skogai/config"` /
`SKOGAI_CONFIG=".skogai/config"`) only takes effect where `direnv allow` has
actually been run for that specific directory — new worktrees
(`~/harness/.claude/worktrees/<name>`, used by both `remote-control` and
`claude-desktop`) haven't had `direnv allow` run inside them, so it silently
doesn't apply there. But that's not actually where the observed values come
from in practice:

`skogcli config list` is the source of truth for the current skogcli
environment. It shows a flat dotted store with per-agent `env.*` blocks
(`skogai.env.*`, `claude.env.*`, `ansible.env.*`, ...), and
`.skogai/scripts/env.sh` wraps `skogcli config get "$1.env.$2" --raw` to read
one var for one agent. `skogcli config list` on this machine shows:

- `skogai.env.SKOGAI_CONFIG = "/home/skogix/skogai/config"` — this is
  exactly the value seen in the `remote-control` environment. Confirms that
  environment reads through the `skogai` namespace, not `.envrc`.
- `claude.env.SKOGAI_CONFIG = "./skogai/config"` — a *different*, agent-scoped
  override for `claude` specifically, sitting unused unless something
  resolves `claude.env.*` before falling back to `skogai.env.*`.

`skogcli script list` shows which scripts (global vs user, `env`,
`claude-code-init`, the `worktree-pre/post-*` hooks, etc.) are available to
run this resolution — together, `skogcli config list` + `skogcli script list`
is how to read "what is the current skogcli environment" from inside any
session, more reliably than checking `.envrc`/direnv state.

**Planned direction:** have `skogcli` set `SKOGAI_*` (and per-agent `env.*`)
based on detected environment/mode directly, rather than depending on
`.envrc`/direnv reaching every worktree, and rather than leaving
`<agent>.env.*` overrides unread. Not implemented yet; update this doc once
it lands.

## `SKOGAI_CONFIG_DIR` scopes the whole store, not just one value

`SKOGAI_CONFIG_DIR` doesn't just change where `SKOGAI_CONFIG` points — it
changes which config file `skogcli` reads and writes *entirely*, including
`settings.script.global_scripts_dir`/`user_scripts_dir` (so `skogcli script
list` and `skogcli script run <name>` also change). Verified by pointing it
at three different places:

- `SKOGAI_CONFIG_DIR=/home/skogix/skogai/config` (the workstation-wide
  config) → `global_scripts_dir` resolves to `/home/skogix/skogai/scripts`,
  and `skogcli script list`/`config list` show every agent/script/env var
  shared across every repo on this machine.
- `SKOGAI_CONFIG_DIR=.skogai/config` (this repo's checked-in config) →
  `global_scripts_dir` resolves to `./scripts` instead, and only the
  handful of keys actually committed under `.skogai/config/config.json`
  are visible (e.g. just `PAGER`/`SKOGAI_AGENT_NAME` for `skogai`/`claude`,
  not the full workstation set).
- `SKOGAI_CONFIG_DIR=/tmp/some-new-dir` (a path with nothing in it) →
  `skogcli` doesn't error, it **bootstraps a brand-new default
  `config.json`** at that path, seeded with the base SkogAI notation
  vocabulary and empty scaffolding for the standard agent namespaces
  (`claude`, `dot`, `amy`, `goose`, `librarian`, `blacksmith`, `letta`).
  Nothing from any other config leaks in.

This gives three usable scoping strategies for a project, from most to
least sharing:

1. **Fully shared** — point at the workstation config
   (`/home/skogix/skogai/config`) to see/set every agent's env vars across
   every repo.
2. **Repo-scoped** — this repo's `.skogai/config` (via `.envrc`, when
   direnv has actually run) holds only what's checked in, independent of
   the workstation store.
3. **Sub-scoped within a repo** — point `SKOGAI_CONFIG_DIR` at a path that
   doesn't exist yet (e.g. `.claude/skogai/config`) to get a second,
   isolated config seeded fresh on first use — useful when one project
   needs more than one independent config (e.g. one for the repo at large,
   another scoped to a specific tool/subsystem).

`skogcli config export-env --namespace ns1,ns2,...` merges the listed
namespaces' `env.*` blocks left to right, with **later namespaces winning**
on key conflicts — e.g. `--namespace skogai,claude` uses `claude.env.PAGER`
over `skogai.env.PAGER` if both are set, since `claude` is listed last.

`.skogai/scripts/env.sh` (a user script, so it follows `user_scripts_dir`
rather than `global_scripts_dir`) wraps this lookup for a single
`namespace.env.VAR` pair, in the same `argc`-based form as the global
example scripts (`scripts/port.sh`, `.skogai/scripts/fizz.sh`): a
`# @describe`/`# @arg`/`# @env LLM_OUTPUT` header, a `main()` that writes to
`$LLM_OUTPUT`, and `eval "$(argc --argc-eval "$0" "$@")"` at the end to
parse args and dispatch.

## Why this matters for how you work

- **remote-control** (local, worktree-isolated): full local toolchain
  (mise-pinned node/bun/python, `skogcli`, CodeGraph if indexed), but
  non-interactive — any MCP server needing an OAuth/device-code flow must
  already be authorized before the session starts, since there's no
  interactive prompt to complete it.
- **remote-anthropic** (cloud): nothing persists unless committed and
  pushed — the container is thrown away after inactivity. System tool
  versions are whatever Ubuntu 24.04 ships (older than the repo's
  `mise.toml` pins), `mise` itself isn't installed, and GitHub access goes
  through MCP tools instead of `gh`. Outbound network goes through a proxy.
- **claude-desktop** (local, Desktop app): same machine and toolchain as an
  interactive terminal session (mise shims resolve correctly), plus
  Desktop-only extras — CodeGraph, additional MCP connectors, visual diff
  review. `.envrc` still doesn't auto-load, so `SKOGAI_CONFIG*` vars need
  exporting by hand.

## Notes

- `worktree-bridge-<session-id>` is Claude Code's own branch naming for
  sessions started with `--spawn worktree` — not a harness-specific wrapper.
  No separate bridging mechanism to look for.
