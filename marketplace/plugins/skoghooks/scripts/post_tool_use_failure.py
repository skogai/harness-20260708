#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///

import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "utils"))
from runtime_dir import get_runtime_dir
from jsonl_log import append_jsonl

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional


def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Add timestamp to the log entry
        input_data['logged_at'] = datetime.now().isoformat()

        # Extract key fields for enhanced logging
        tool_name = input_data.get('tool_name', 'unknown')
        tool_use_id = input_data.get('tool_use_id', 'unknown')
        error = input_data.get('error', {})

        # Create a structured log entry with error details
        log_entry = {
            'timestamp': input_data['logged_at'],
            'session_id': input_data.get('session_id', ''),
            'hook_event_name': input_data.get('hook_event_name', 'PostToolUseFailure'),
            'tool_name': tool_name,
            'tool_use_id': tool_use_id,
            'tool_input': input_data.get('tool_input', {}),
            'error': error,
            'cwd': input_data.get('cwd', ''),
            'permission_mode': input_data.get('permission_mode', ''),
            'transcript_path': input_data.get('transcript_path', ''),
            'raw_input': input_data
        }

        # Ensure log directory exists
        log_dir = get_runtime_dir(log_entry['session_id'])
        log_path = log_dir / 'post_tool_use_failure.jsonl'
        append_jsonl(log_path, log_entry)

        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Exit cleanly on any other error
        sys.exit(0)


if __name__ == '__main__':
    main()
