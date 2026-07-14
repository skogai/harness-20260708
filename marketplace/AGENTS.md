# AGENTS.md

## Scope
- This repo is a Claude Code plugin/marketplace reference implementation, not a normal Python package: there is no root `pyproject.toml`, lockfile, or test runner config.
- The distributable plugin lives in `plugins/skoghooks/`; the root `.claude-plugin/marketplace.json` only points marketplace installs at that plugin.

## OpenCode And Claude Code Setup
- No repo-local OpenCode config (`opencode.json` or `.opencode/`) is present.
- The active local Claude settings are `.claude/settings.json`; they only disable unrelated skills and allow `Bash(python *)`.
- `.claude/settings2.json` and `.claude/settings3.json` are reference hook configs, not the distributed plugin source of truth.
- The installed plugin source of truth is `plugins/skoghooks/hooks/hooks.json`, which uses `${CLAUDE_PLUGIN_ROOT}` paths.
- Validate plugin changes with `claude plugin validate ./plugins/skoghooks` and validate the marketplace with `claude plugin validate .`.
- Test the plugin locally without installing it with `claude --plugin-dir ./plugins/skoghooks`.

## Commands
- Run an individual hook from the repo root, for example:
  `echo '{"session_id":"test","hook_event_name":"SessionStart"}' | uv run plugins/skoghooks/scripts/session_start.py --load-context`
- `uv` must be on `PATH`; hook scripts use inline PEP 723 metadata instead of shared project dependencies.
- Hooks that use Ollama only need it opportunistically: `user_prompt_submit.py --name-agent` calls local Ollama via `OLLAMA_MODEL` (default `gpt-oss:20b`) and silently continues if unavailable.

## Hook Wiring Gotchas
- Keep `plugins/skoghooks/hooks/hooks.json` in sync with script flags; it wires all 13 lifecycle events.
- Runtime logs/backups go to `$CLAUDE_CODE_TMPDIR/skoghooks/<session_id>/` when set, otherwise `/tmp/skoghooks/<session_id>/`; do not expect `logs/` in the repo.
- Most hooks must catch exceptions and exit `0`; only intentional blocking should exit `2`.
- `pre_tool_use.py` currently logs only. The `rm -rf` and `.env` blocking helpers are present but disabled because they caused false positives.
- `permission_request.py --auto-allow` exists but is not wired by default; distributed config uses `--log-only`.
- `stop.py --chat` and `subagent_stop.py --chat` export transcript JSONL to the session runtime `chat.json`.
- `pre_compact.py --backup` stores transcript backups under the session runtime directory.
- `setup.py` always emits `additionalContext`; `--install-deps` is supported but not wired.

## Files To Avoid Treating As Runtime State
- `.claude/data/sessions`, `.claude/data/tts_queue`, root `logs/`, script `__pycache__`, and validator logs are gitignored runtime artifacts.
