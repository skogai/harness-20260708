# Task Completion

- For hook/plugin changes, run `uv run scripts/test_hooks.py`; expect all wired hooks to exit successfully against `tests/payloads/*.json`.
- Validate plugin package after hook wiring or manifest changes: `claude plugin validate ./plugins/skoghooks`.
- Validate marketplace after root `.claude-plugin/marketplace.json` changes: `claude plugin validate .`.
- For Python file edits, run LSP diagnostics on changed files when available; hook scripts should still be exercised through representative JSON stdin or `scripts/test_hooks.py`.
- For new hooks, also verify `plugins/skoghooks/hooks/hooks.json` contains the expected event/matcher/flags and documentation mentions the new hook if user-facing.
- Do not commit unless explicitly requested.