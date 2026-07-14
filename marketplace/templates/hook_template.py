#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""{{EVENT}} hook: {{DESCRIPTION}}

Contract (see CLAUDE.md "Hook Pattern"):
- read the event payload as JSON from stdin
- exit 0 always, unless deliberately blocking (stderr + exit 2)
- never crash: wrap everything in try/except and exit 0
- log to <runtime_dir>/{{NAME}}.jsonl via append_jsonl()
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "utils"))
from runtime_dir import get_runtime_dir
from jsonl_log import append_jsonl


def main():
    parser = argparse.ArgumentParser()
    # parser.add_argument("--my-flag", action="store_true", help="...")
    # parse_known_args: an unknown flag must never crash a hook (argparse
    # would exit 2, which Claude Code interprets as a block)
    args, _unknown = parser.parse_known_args()

    try:
        input_data = json.load(sys.stdin)
        session_id = input_data.get("session_id", "unknown")
        log_dir = get_runtime_dir(session_id)
        append_jsonl(log_dir / "{{NAME}}.jsonl", input_data)

        # --- hook-specific logic goes here ---
        #
        # Block the tool call ({{EVENT}} must be PreToolUse/PermissionRequest):
        #     print("reason shown to Claude", file=sys.stderr)
        #     sys.exit(2)
        #
        # Inject context back into the conversation:
        #     print(json.dumps({"hookSpecificOutput": {
        #         "hookEventName": "{{EVENT}}",
        #         "additionalContext": "...",
        #     }}))

    except Exception:
        pass  # never crash a hook
    sys.exit(0)


if __name__ == "__main__":
    main()
