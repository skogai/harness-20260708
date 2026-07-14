# Suggested Commands

- Run one wired hook directly: `echo '{"session_id":"test","hook_event_name":"SessionStart"}' | uv run plugins/skoghooks/scripts/session_start.py --load-context`
- Scaffold and wire a new hook: `uv run scripts/new_hook.py <Event> <name> [--matcher "Write|Edit"] [--flags="--my-flag"]`
- Smoke-test wired hooks with payload fixtures: `uv run scripts/test_hooks.py`
- Validate distributable plugin: `claude plugin validate ./plugins/skoghooks`
- Validate marketplace catalog: `claude plugin validate .`
- Test plugin locally without installing: `claude --plugin-dir ./plugins/skoghooks`
- Install from local marketplace in Claude Code: `/plugin marketplace add ./` then `/plugin install skoghooks@skoghooks`
- Memory sanity check after memory edits: `serena memories check` from repo root.