# Claude Code configuration

This directory is dropped into your project by `npx skogharness --agent claude` or `--agent all`. It gives Claude Code domain, agent-tooling, cleanup, and TOON (Token-Oriented Object Notation) skills plus a thin TOON command layer.

## What's here

| Path                               | Purpose                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `commands/convert-to-toon.md` etc. | 5 TOON slash commands.                                                             |
| `utils/toon/cli.mjs`               | 90-line wrapper around `@toon-format/toon` and `gpt-tokenizer`.                    |
| `hooks/`                           | Optional post-tool automation. Disabled by default in `settings.json`.             |
| `settings.json`                    | Shared defaults (fail-closed). Put local trust overrides in `settings.local.json`. |
