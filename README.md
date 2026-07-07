# skogai/harness

Declarative agent config for Claude Code and Codex: a `skogai.json` manifest for skills, MCP servers, and stack profiles, synced to each agent's native config, plus hand-maintained skills.

## Install

```bash
npx skogharness@latest
# or, for a local global install:
bun run install:global
```

Installs as both `skogharness` and `harness` on your `PATH`.

## Usage

```bash
harness init [dir]              # initialize harness in a directory (default command)
  -y, --yes                     # skip confirmation prompts
  -f, --force                   # overwrite existing files
  --agent <list>                # agent target(s): claude, codex, or all (default: claude)
  --profile <name>               # preset profile: all, minimal, custom
  --skills <list>                # comma-separated skills to install
  --no-toon                      # skip TOON utilities

harness sync [dir]              # write native agent config for every target in skogai.json
harness status [dir]            # diff skogai.json against native config; exits 1 on drift

harness add mcp <name>          # add an MCP server (catalog name, or --command/--url)
harness add skill <name>        # add a skill from the harness skill set
```

Everything the CLI writes is driven by `skogai.json` at the target directory's root; run `harness status .` at any time to see what's out of sync.

## Skill pack

`.claude-plugin/marketplace.json` exposes the maintained skills (currently `toon-formatter` and `harness-creator`, under `templates/.claude/skills/`) as a Claude Code plugin marketplace:

```bash
/plugin marketplace add skogai/harness
```

## Development

See [AGENTS.md](./AGENTS.md) for project structure, build/test commands, and coding conventions.
See [docs/](./docs/) for implementation rationale and maintenance notes.

## License

MIT — see [LICENSE](./LICENSE).
