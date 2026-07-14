#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Smoke-test every hook wired in hooks/hooks.json.

For each event entry in hooks.json, pipes tests/payloads/<Event>.json into the
exact command the plugin would run (with CLAUDE_PLUGIN_ROOT resolved) and
asserts it exits 0. Hooks must never crash — a non-zero exit here is a bug.

Usage:
    uv run scripts/test_hooks.py               # run everything
    uv run scripts/test_hooks.py --event Stop  # run one event
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PLUGIN_ROOT = REPO_ROOT / "plugins" / "skoghooks"
HOOKS_JSON = PLUGIN_ROOT / "hooks" / "hooks.json"
PAYLOADS_DIR = REPO_ROOT / "tests" / "payloads"
TIMEOUT_SECONDS = 60


def run_hook(command: str, payload: str) -> tuple[int, str]:
    env = {**os.environ, "CLAUDE_PLUGIN_ROOT": str(PLUGIN_ROOT)}
    try:
        result = subprocess.run(
            command, shell=True, input=payload, env=env, cwd=REPO_ROOT,
            capture_output=True, text=True, timeout=TIMEOUT_SECONDS,
        )
        return result.returncode, (result.stderr or "").strip()
    except subprocess.TimeoutExpired:
        return -1, f"timed out after {TIMEOUT_SECONDS}s"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--event", default=None, help="run only this event (e.g. PreToolUse)")
    args = parser.parse_args()

    config = json.loads(HOOKS_JSON.read_text(encoding="utf-8"))["hooks"]
    events = [args.event] if args.event else list(config)
    failures = 0
    ran = 0

    for event in events:
        if event not in config:
            print(f"error: event {event!r} not wired in hooks.json", file=sys.stderr)
            sys.exit(1)
        payload_file = PAYLOADS_DIR / f"{event}.json"
        if not payload_file.exists():
            print(f"SKIP  {event}: no fixture at {payload_file.relative_to(REPO_ROOT)}")
            continue
        payload = payload_file.read_text(encoding="utf-8")

        for group in config[event]:
            for hook in group.get("hooks", []):
                command = hook["command"]
                code, stderr = run_hook(command, payload)
                ran += 1
                label = command.replace('"${CLAUDE_PLUGIN_ROOT}"/', "").replace("${CLAUDE_PLUGIN_ROOT}/", "")
                if code == 0:
                    print(f"PASS  {event}: {label}")
                else:
                    failures += 1
                    print(f"FAIL  {event}: {label} (exit {code})")
                    if stderr:
                        for line in stderr.splitlines()[:8]:
                            print(f"      {line}")

    print(f"\n{ran - failures}/{ran} hooks passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
