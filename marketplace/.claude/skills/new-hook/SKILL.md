---
name: new-hook
description: Create a new skoghooks hook script and wire it into the plugin. Use when asked to add a hook, hook behavior, validator wiring, or lifecycle handler to skoghooks — covers scaffolding, implementation, testing, and documentation.
---

# Creating a new skoghooks hook

Follow these steps in order. Never skip the test step — a hook that crashes
breaks every session for everyone who has the plugin installed.

## 1. Scaffold

```shell
uv run scripts/new_hook.py <Event> <name> [--matcher "Write|Edit"] [--flags="--my-flag"]
```

- `<Event>` is one of the 13 lifecycle events (SessionStart, SessionEnd, Setup,
  UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure,
  PermissionRequest, Notification, Stop, SubagentStart, SubagentStop, PreCompact).
- `<name>` is snake_case; it becomes `plugins/skoghooks/scripts/<name>.py`.
- Use `--matcher` only on tool events (PreToolUse, PostToolUse,
  PostToolUseFailure, PermissionRequest) to scope which tools trigger it.
- Note `--flags="--x"` (equals sign) — argparse rejects a separate `"--x"` value.

The scaffolder creates the script from `templates/hook_template.py` and appends
the command entry to `plugins/skoghooks/hooks/hooks.json`.

## 2. Implement

Edit the generated script. The contract every hook must honor:

- Read the JSON payload from stdin; tolerate missing fields (`.get()` everywhere).
- Exit 0 always. Exit 2 **only** to deliberately block (print the reason to
  stderr first). Any other non-zero exit is a bug.
- Wrap logic in `try/except Exception: pass` — a hook must never crash.
- Declare CLI flags with `parser.add_argument`, keep `parse_known_args()` so
  unknown flags can't crash the hook.
- Log via `append_jsonl(log_dir / "<name>.jsonl", ...)`; get `log_dir` from
  `get_runtime_dir(session_id)`.
- To inject context, print `{"hookSpecificOutput": {"hookEventName": "<Event>",
  "additionalContext": "..."}}` to stdout and exit 0.
- Reusable checks belong in `plugins/skoghooks/scripts/validators/`, shared
  helpers in `plugins/skoghooks/scripts/utils/`.

## 3. Test

```shell
cat tests/payloads/<Event>.json | uv run plugins/skoghooks/scripts/<name>.py   # manual
uv run scripts/test_hooks.py --event <Event>                                  # one event
uv run scripts/test_hooks.py                                                  # full suite
```

The suite pipes each fixture through the exact command wired in hooks.json and
requires exit 0. If the hook needs a payload field the fixture lacks, extend
the fixture (keep it representative of the real event shape).

For a blocking hook, additionally verify the block path by hand: feed it a
payload that should block and confirm exit code 2 with the reason on stderr.

## 4. Validate the plugin

```shell
claude plugin validate ./plugins/skoghooks
claude plugin validate .
```

If the `claude` CLI is unavailable, at minimum check hooks.json parses:
`python3 -c "import json; json.load(open('plugins/skoghooks/hooks/hooks.json'))"`.

## 5. Document

- Add the hook to the flag table and event table in `CLAUDE.md` and
  `plugins/skoghooks/README.md`.
- If behavior is non-obvious (blocking rules, external calls, env vars), add a
  bullet under "Non-Obvious Behaviours" in `CLAUDE.md`.

## 6. Commit

One hook per commit. Subject in imperative mood, e.g.
`Add markdown_formatter PostToolUse hook`.
