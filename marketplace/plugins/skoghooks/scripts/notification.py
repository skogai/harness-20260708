#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "utils"))
from runtime_dir import get_runtime_dir
from jsonl_log import append_jsonl


def main():
    try:
        input_data = json.load(sys.stdin)
        session_id = input_data.get("session_id", "unknown")
        log_dir = get_runtime_dir(session_id)
        append_jsonl(log_dir / "notification.jsonl", input_data)
    except Exception:
        pass
    sys.exit(0)


if __name__ == "__main__":
    main()
