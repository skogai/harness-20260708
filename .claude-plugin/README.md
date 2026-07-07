# skogai/harness Plugin Marketplace

This directory contains the plugin marketplace configuration for skogai/harness, making it easy for users to install the skill pack with a single command.

## For Users: Installation

```bash
/plugin marketplace add skogai/harness
```

## What's Included

`marketplace.json` currently exposes two plugins, sourced from `templates/.claude/skills/`:

- **toon-formatter** (`optimization`) — TOON format for 30-60% token savings on tabular data
- **harness-creator** (`harnessing`) — scaffolds new agent harnesses (see `templates/.claude/skills/harness-creator/`)

## For Developers: Publishing

This plugin marketplace configuration makes skogai/harness discoverable via the Claude Code Plugin System (`/plugin marketplace add`).

Adding a plugin means adding an entry to `marketplace.json` pointing at a skill directory under `templates/.claude/skills/<name>/`, and keeping the source path in sync with what actually exists there.

## Structure

```
.claude-plugin/
├── marketplace.json    # Plugin marketplace configuration
└── README.md           # This file
```

## Learn More

- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces.md)
- [Agent Skills Specification](https://agentskills.io/)
