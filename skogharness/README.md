# skogharness

Installer package for this repo's `.claude/` content. Source content lives
under `src/skogharness/<category>/` (skills, agents, commands, modes, mcp);
`skogharness install <category>` copies it into a target `.claude/`
directory.

No manifest, sync, status, or drift-detection mechanism — installs are
plain copies you re-run when source content changes.

## Usage

```sh
uv run skogharness install skills [--target DIR] [--dry-run]
```

Defaults to installing into `$CLAUDE_PROJECT_DIR/.claude/skills` (falling
back to `<repo-root>/.claude/skills` when unset).
