#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

import json
from pathlib import Path

SHARED_LOG_PATH = Path.home() / ".claude" / "data" / "skoghooks.jsonl"


def _write_line(path: Path, record: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")


def append_jsonl(path: Path, record: dict) -> None:
    """Append one record to a JSONL file as a single JSON line, and mirror
    it to the shared cross-session, cross-project log at SHARED_LOG_PATH.

    Creates parent directories if missing. Non-serializable values are
    stringified (default=str) — hooks must never crash on logging.
    """
    _write_line(Path(path), record)
    _write_line(SHARED_LOG_PATH, record)
