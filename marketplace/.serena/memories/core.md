# Core

- Claude Code plugin + marketplace reference implementation for all 13 hook lifecycle events; not a normal Python package.
- Distributable source of truth: `plugins/skoghooks/`.
- Marketplace catalog: `.claude-plugin/marketplace.json` points installs at `./plugins/skoghooks`.
- Plugin manifest: `plugins/skoghooks/.claude-plugin/plugin.json`.
- Hook wiring source of truth: `plugins/skoghooks/hooks/hooks.json`; commands use `${CLAUDE_PLUGIN_ROOT}` paths.
- Hook scripts: `plugins/skoghooks/scripts/*.py`; one standalone `uv run --script` entrypoint per lifecycle event.
- Scaffolding/validation helpers outside plugin: `scripts/new_hook.py`, `scripts/test_hooks.py`, `templates/hook_template.py`, `tests/payloads/*.json`.
- Runtime state/logs/backups are session-scoped under `$CLAUDE_CODE_TMPDIR/skoghooks/<session_id>/` or `/tmp/skoghooks/<session_id>/`; do not expect repo-local logs.
- Root `.claude/settings*.json` are local/reference configs, not distributed plugin source of truth.
- Read `mem:tech_stack` for runtime/tooling, `mem:conventions` for hook behavior, `mem:suggested_commands` for commands, `mem:task_completion` for done checks.