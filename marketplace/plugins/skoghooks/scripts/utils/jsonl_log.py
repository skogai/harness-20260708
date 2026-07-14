#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

import json
from pathlib import Path


def append_jsonl(path: Path, record: dict) -> None:
    """Append one record to a JSONL file as a single JSON line.

    Creates parent directories if missing. Non-serializable values are
    stringified (default=str) — hooks must never crash on logging.
    """
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
