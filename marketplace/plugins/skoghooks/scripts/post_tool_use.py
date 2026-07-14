#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "utils"))
from runtime_dir import get_runtime_dir
from jsonl_log import append_jsonl

def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Ensure log directory exists
        session_id = input_data.get('session_id', 'unknown')
        log_dir = get_runtime_dir(session_id)
        log_path = log_dir / 'post_tool_use.jsonl'
        append_jsonl(log_path, input_data)

        sys.exit(0)
        
    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Exit cleanly on any other error
        sys.exit(0)

if __name__ == '__main__':
    main()