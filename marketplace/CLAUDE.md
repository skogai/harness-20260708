# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Reference implementation of all 13 Claude Code hook lifecycle events, packaged as a distributable Claude Code plugin and marketplace. No TTS, no external API calls — hooks log events and inject context only.

## Repository Layout

```
skoghooks/
├── .claude-plugin/
│   └── marketplace.json        ← marketplace catalog
├── plugins/
│   └── skoghooks/              ← the distributable plugin
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── hooks/
│       │   └── hooks.json      ← all 13 hook events (${CLAUDE_PLUGIN_ROOT} paths)
│       └── scripts/
│           ├── session_start.py .. pre_compact.py  (13 hooks)
│           ├── utils/          ← runtime_dir.py, jsonl_log.py, llm/, tts/
│           └── validators/     ← ruff_validator, ty_validator, validate_file_contains, validate_new_file
├── scripts/
│   ├── new_hook.py             ← scaffold a new hook + wire it into hooks.json
│   └── test_hooks.py           ← smoke-test every wired hook against tests/payloads/
├── templates/
│   └── hook_template.py        ← canonical hook skeleton used by new_hook.py
├── tests/
│   └── payloads/               ← one representative stdin payload per event (13 fixtures)
└── .claude/
    ├── skills/new-hook/        ← /new-hook workflow skill (scaffold → implement → test → document)
    └── settings*.json          ← local settings (no hooks wired; hooks only fire via plugin install)
```

Hook logs are written at runtime to `<tmp>/skoghooks/<session_id>/` (see `utils/runtime_dir.py`), not into the repo.

## Creating a New Hook

Use the `/new-hook` skill, or by hand:

```shell
uv run scripts/new_hook.py <Event> <name> [--matcher "Write|Edit"] [--flags="--my-flag"]
# implement plugins/skoghooks/scripts/<name>.py, then:
uv run scripts/test_hooks.py                   # all fixtures through all wired hooks, expect exit 0
claude plugin validate ./plugins/skoghooks
```

Every hook must exit 0 (exit 2 only to deliberately block) — `scripts/test_hooks.py` enforces this by piping `tests/payloads/<Event>.json` through the exact commands wired in `hooks.json`.

## Install as a Plugin

```shell
# Test locally (no install)
claude --plugin-dir ./plugins/skoghooks

# Add this repo as a marketplace, then install
/plugin marketplace add ./
/plugin install skoghooks@skoghooks

# Validate before publishing
claude plugin validate ./plugins/skoghooks
claude plugin validate .
```

Once pushed to GitHub, anyone can add it with:
```shell
/plugin marketplace add <gh-user>/skoghooks
/plugin install skoghooks@skoghooks
```

## Hook Pattern

Every hook follows this structure:

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
import json, sys
from pathlib import Path

input_data = json.load(sys.stdin)
# ... hook-specific logic ...
# log to <runtime_dir>/{name}.jsonl via append_jsonl() (utils/jsonl_log.py)
sys.exit(0)                          # never exit non-zero unless blocking
```

**Block a tool call**: print reason to stderr, `sys.exit(2)`.  
**Output context**: print `{"hookSpecificOutput": {"additionalContext": "..."}}` then exit 0.  
**Never crash**: all hooks catch all exceptions and exit 0.

**Test a hook locally**: `echo '{"session_id":"test","hook_event_name":"SessionStart"}' | uv run plugins/skoghooks/scripts/session_start.py --load-context`

## Hook Event → File

| Event              | File                     | Active flags                                        |
| ------------------ | ------------------------ | --------------------------------------------------- |
| SessionStart       | session_start.py         | `--load-context`                                    |
| SessionEnd         | session_end.py           | —                                                   |
| Setup              | setup.py                 | —                                                   |
| PreToolUse         | pre_tool_use.py          | —                                                   |
| PostToolUse        | post_tool_use.py         | —                                                   |
| PostToolUseFailure | post_tool_use_failure.py | —                                                   |
| UserPromptSubmit   | user_prompt_submit.py    | `--log-only --store-last-prompt --name-agent`       |
| PermissionRequest  | permission_request.py    | `--log-only`                                        |
| Notification       | notification.py          | —                                                   |
| Stop               | stop.py                  | `--chat`                                            |
| SubagentStart      | subagent_start.py        | —                                                   |
| SubagentStop       | subagent_stop.py         | `--chat`                                            |
| PreCompact         | pre_compact.py           | `--backup`                                          |

## Non-Obvious Behaviours

- **pre_tool_use.py**: the `rm -rf` / `.env`-access blocking checks are currently **disabled** (too many false positives, e.g. `git rm -rf`); `is_dangerous_rm_command()` and `is_env_file_access()` are kept in the file but unused. It logs only.
- **permission_request.py** with `--auto-allow`: outputs `{behavior: "allow"}` for Read/Glob/Grep and 16 safe bash patterns. Not active in the distributed `hooks.json` — only `--log-only` is wired by default.
- **session_start.py** with `--load-context`: outputs git branch, uncommitted count, TODO.md, and open GitHub issues as `additionalContext`. Context files are truncated at 1000 chars each.
- **stop.py** with `--chat`: converts the session transcript JSONL → `logs/chat.json`. Same logic in `subagent_stop.py`.
- **setup.py**: always injects `additionalContext` (trigger, session, cwd, detected project files, tool versions) on every run — no flag required, unlike other hooks. With `--install-deps`: auto-detects `package.json`/`requirements.txt`/`pyproject.toml` and runs the appropriate installer (`npm ci`, `pip install -r`, or `uv sync`).
- **session_end.py** with `--cleanup`: removes `logs/*.tmp` files and deletes `logs/chat.json` if older than 24 hours.
- **user_prompt_submit.py** with `--name-agent`: calls `utils/llm/ollama.py --agent-name` (local Ollama, model via `OLLAMA_MODEL` env, default `gpt-oss:20b`). If Ollama is unavailable, agent name is simply not set. Stored in `.claude/data/sessions/{session_id}.json`.

## Available Script Flags

| Script               | All supported flags                                                    |
| -------------------- | ---------------------------------------------------------------------- |
| session_start.py     | `--load-context` `--announce`                                          |
| session_end.py       | `--cleanup`                                                            |
| setup.py             | `--install-deps` `--verbose`                                           |
| user_prompt_submit.py| `--log-only` `--store-last-prompt` `--name-agent` `--validate`        |
| permission_request.py| `--log-only` `--auto-allow`                                            |
| stop.py              | `--chat`                                                               |
| subagent_stop.py     | `--chat`                                                               |
| pre_compact.py       | `--backup` `--verbose`                                                 |
