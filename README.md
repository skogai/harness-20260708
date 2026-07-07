# skogai/harness

An opinionated multi-agent skill pack for Claude Code and Codex. Deep, handwritten skills for HCI usability modeling, Apple HIG Doctor guidance, copywriting, code cleanup, and TOON token savings.

No orchestration framework. No aspirational YAML. Just agent-native project files generated from one shared skill source.

[![npm version](https://img.shields.io/npm/v/skogharness.svg)](https://www.npmjs.com/package/skogharness)
[![npm downloads](https://img.shields.io/npm/dt/skogharness.svg)](https://www.npmjs.com/package/skogharness)
[![GitHub stars](https://img.shields.io/github/stars/skogai/harness?style=social)](https://github.com/skogai/harness/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Star History

<a href="https://star-history.com/#skogai/harness&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=skogai/harness&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=skogai/harness&type=Date" />
    <img alt="Star history chart for skogai/harness" src="https://api.star-history.com/svg?repos=skogai/harness&type=Date" />
  </picture>
</a>

## What you get

**29 shipped skills**:

| Skill | Covers |
|---|---|
| **toon-formatter** | When TOON helps, when it does not, and how to invoke the TOON commands. |

## Agent Targets

| Agent | Generated output | Notes |
|---|---|---|
| Claude Code | `.claude/` | Native Claude skills, settings, TOON slash commands, optional hooks. |
| Codex | `AGENTS.md` + `.codex/skills/*/SKILL.md` | Root Codex guidance points to project-local skill files. |

Claude remains the default for backwards compatibility. Use `--agent all` to install all supported targets.

## Install

First run / project setup:

```bash
# Claude Code only (default)
npx skogharness@latest

# Codex only
npx skogharness@latest --agent codex

# Claude Code + Codex
npx skogharness@latest --agent all
```

Optional global CLI for repeated `sync`, `status`, and `add` commands:

```bash
npm i -g skogharness

harness sync
harness status
harness add mcp neon
harness add skill cleanup-types
```

For team setup, prefer the `npx skogharness@latest ...` commands above so contributors do not need a preinstalled global binary.

For Claude TOON commands, add the runtime deps to your project:

```bash
npm i @toon-format/toon gpt-tokenizer
```

## Profiles

```bash
npx skogharness@latest --profile all --agent all
npx skogharness@latest --profile apple-hig --agent codex
npx skogharness@latest --profile design-hci --agent codex
npx skogharness@latest --skills copywriting-frameworks,cleanup-unused --agent codex
```

Profiles select a skill set. Agent targets decide where that skill set is installed.

Stack profiles (`next-saas`, `next`, `node`, `base`) additionally bundle MCP servers for the stack. `init` auto-detects the right one from `package.json`.

## skogai.json

`init` writes a `skogai.json` manifest at the project root — the single declaration of the project's agent environment (profile, targets, skills, MCP servers). Check it into git; every contributor then runs:

```bash
npx skogharness@latest sync
```

or `harness sync` after installing the global CLI, and gets identical native config for whichever agent they use: skills plus `.mcp.json` (Claude Code) and `.codex/config.toml` + `AGENTS.md` (Codex). Sync is idempotent — generated sections are fenced with `<harness:generated>` tags, manual edits outside them survive, and MCP entries harness didn't write are never touched.

```bash
npx skogharness@latest status            # diff skogai.json vs native configs; exits 1 on drift
npx skogharness@latest add mcp neon      # catalog: github, neon, stripe, resend
npx skogharness@latest add mcp internal --command ./bin/mcp --env API_KEY='${API_KEY}'
npx skogharness@latest add skill cleanup-types
```

Secrets are referenced as `${VAR}` and resolved by each agent at runtime — never written to the generated files. Sync appends missing vars to `.env.example` and warns when they're unset.

The `next-saas` profile is the flagship: cleanup + copywriting skills, the `finish-setup` provisioning skill, and Neon/Stripe/Resend/GitHub MCPs — designed as the companion to a Next.js SaaS template. After scaffolding, open your agent and say "finish setup": the agent creates Stripe products to match your billing plans, verifies migrations, and walks email DNS via the wired MCPs.

## Structure

```text
.claude/
  skills/<skill>/skill.md
  commands/
  utils/toon/cli.mjs

.codex/
  skills/<skill>/SKILL.md
AGENTS.md
```

The package keeps one shared source of truth in `templates/.claude/skills/` and generates the Codex format from that source during install.

The Apple HIG skills are vendored from [HIG Doctor](https://apple.raintree.technology), including the progressive-disclosure `references/` corpus with canonical Apple source links and attribution. The `hig-doctor-audit` skill points agents at HIG Doctor's published audit CLI and verification workflow.

## Requirements

- Node.js >= 18
- Claude Code or Codex, depending on the selected target
- Optional: `@toon-format/toon` and `gpt-tokenizer` for Claude TOON slash commands

## License

MIT. Not affiliated with Anthropic, Apple, OpenAI, or `@toon-format/toon`.
