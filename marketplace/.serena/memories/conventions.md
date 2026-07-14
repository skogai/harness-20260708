# Conventions

- Every hook script should be standalone, JSON-stdin driven, and normally `sys.exit(0)`.
- Intentional blocking uses stderr plus `sys.exit(2)`; unhandled operational failures should be caught and converted to exit 0.
- Context injection output format: `{"hookSpecificOutput": {"additionalContext": "..."}}`.
- Hook logs use `scripts/utils/runtime_dir.py` + `append_jsonl()`; runtime artifacts are outside repo under session temp dirs.
- Keep `plugins/skoghooks/hooks/hooks.json` in sync with script flags; distributed config wires all 13 lifecycle events.
- `PreToolUse` distributed behavior is logging only; dangerous `rm -rf` / `.env` helpers exist but are disabled to avoid false positives.
- `PermissionRequest --auto-allow` exists but distributed config uses `--log-only`.
- `Stop --chat` and `SubagentStop --chat` export transcript JSONL to session runtime `chat.json`.
- `PreCompact --backup` stores transcript backups under session runtime dir.
- `Setup` always emits additional context; `--install-deps` is supported but not wired.
- Prefer the project `/new-hook` skill for adding lifecycle hook behavior.