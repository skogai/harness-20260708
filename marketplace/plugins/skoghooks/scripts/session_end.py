#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent / "utils"))
from runtime_dir import get_runtime_dir
from jsonl_log import append_jsonl

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional


def log_session_end(input_data):
    """Log session end event to logs directory."""
    session_id = input_data.get('session_id', 'unknown')
    log_dir = get_runtime_dir(session_id)
    log_file = log_dir / 'session_end.jsonl'

    # Add timestamp to the input data
    input_data['logged_at'] = datetime.now().isoformat()

    append_jsonl(log_file, input_data)


def perform_cleanup(session_id):
    """Perform optional cleanup tasks at session end."""
    cleanup_actions = []

    # Example cleanup: Remove temporary files from logs directory
    log_dir = get_runtime_dir(session_id)
    if log_dir.exists():
        # Clean up any .tmp files
        for tmp_file in log_dir.glob("*.tmp"):
            try:
                tmp_file.unlink()
                cleanup_actions.append(f"Removed temp file: {tmp_file.name}")
            except Exception:
                pass

    # Example cleanup: Clean up old chat.json if it exists and is stale
    chat_file = log_dir / "chat.json" if log_dir.exists() else None
    if chat_file and chat_file.exists():
        try:
            # Check if file is older than 24 hours
            file_age = datetime.now().timestamp() - chat_file.stat().st_mtime
            if file_age > 86400:  # 24 hours in seconds
                chat_file.unlink()
                cleanup_actions.append("Removed stale chat.json (older than 24 hours)")
        except Exception:
            pass

    return cleanup_actions


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument('--cleanup', action='store_true',
                          help='Perform cleanup tasks at session end')
        args = parser.parse_args()

        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())

        # Extract session_id for cleanup logging
        session_id = input_data.get('session_id', 'unknown')

        # Log the session end event
        log_session_end(input_data)

        # Perform cleanup if requested
        if args.cleanup:
            cleanup_actions = perform_cleanup(session_id)
            if cleanup_actions:
                # Log cleanup actions
                cleanup_log = {
                    "session_id": session_id,
                    "cleanup_at": datetime.now().isoformat(),
                    "actions": cleanup_actions
                }
                log_dir = get_runtime_dir(session_id)
                cleanup_file = log_dir / "cleanup.jsonl"
                append_jsonl(cleanup_file, cleanup_log)

        # Success
        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == '__main__':
    main()
