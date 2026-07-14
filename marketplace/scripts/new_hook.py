#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Scaffold a new skoghooks hook script and wire it into hooks.json.

Usage:
    uv run scripts/new_hook.py <Event> <name> [--matcher PATTERN] [--flags "--foo --bar"]
    uv run scripts/new_hook.py PostToolUse markdown_formatter --matcher "Write|Edit"

Creates plugins/skoghooks/scripts/<name>.py from templates/hook_template.py,
appends a command entry for it under <Event> in hooks/hooks.json, and points
you at the test fixture + smoke runner. Refuses to overwrite existing scripts.
"""

import argparse
import json
import stat
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PLUGIN_ROOT = REPO_ROOT / "plugins" / "skoghooks"
HOOKS_JSON = PLUGIN_ROOT / "hooks" / "hooks.json"
TEMPLATE = REPO_ROOT / "templates" / "hook_template.py"
PAYLOADS_DIR = REPO_ROOT / "tests" / "payloads"

EVENTS = [
    "SessionStart", "SessionEnd", "Setup",
    "UserPromptSubmit", "PreToolUse", "PostToolUse", "PostToolUseFailure",
    "PermissionRequest", "Notification", "Stop",
    "SubagentStart", "SubagentStop", "PreCompact",
]


def fail(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("event", help=f"hook event, one of: {', '.join(EVENTS)}")
    parser.add_argument("name", help="script name in snake_case (becomes scripts/<name>.py)")
    parser.add_argument("--matcher", default=None, help="tool-name matcher, e.g. 'Write|Edit' (tool events only)")
    parser.add_argument("--flags", default="", help="extra CLI flags to wire into the hooks.json command")
    parser.add_argument("--description", default="TODO: describe what this hook does")
    args = parser.parse_args()

    event = args.event
    if event not in EVENTS:
        fail(f"unknown event {event!r}; valid events: {', '.join(EVENTS)}")

    name = args.name.strip().lower().replace("-", "_")
    if not name.replace("_", "").isalnum():
        fail(f"invalid script name {name!r}; use snake_case")

    script_path = PLUGIN_ROOT / "scripts" / f"{name}.py"
    if script_path.exists():
        fail(f"{script_path.relative_to(REPO_ROOT)} already exists; pick another name")

    # 1. materialize the script from the template
    content = TEMPLATE.read_text(encoding="utf-8")
    content = (
        content.replace("{{EVENT}}", event)
        .replace("{{NAME}}", name)
        .replace("{{DESCRIPTION}}", args.description)
    )
    script_path.write_text(content, encoding="utf-8")
    script_path.chmod(script_path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    # 2. wire it into hooks.json
    config = json.loads(HOOKS_JSON.read_text(encoding="utf-8"))
    command = f'uv run "${{CLAUDE_PLUGIN_ROOT}}/scripts/{name}.py"'
    if args.flags.strip():
        command += f" {args.flags.strip()}"
    entry = {"hooks": [{"type": "command", "command": command}]}
    if args.matcher is not None:
        entry = {"matcher": args.matcher, **entry}
    config.setdefault("hooks", {}).setdefault(event, []).append(entry)
    HOOKS_JSON.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")

    # 3. point at the fixture for this event
    payload = PAYLOADS_DIR / f"{event}.json"
    payload_note = (
        f"test payload: {payload.relative_to(REPO_ROOT)}"
        if payload.exists()
        else f"MISSING test payload — create {payload.relative_to(REPO_ROOT)} first"
    )

    rel_script = script_path.relative_to(REPO_ROOT)
    print(f"created  {rel_script}")
    print(f"wired    {event} -> {command}  in {HOOKS_JSON.relative_to(REPO_ROOT)}")
    print(f"fixture  {payload_note}")
    print()
    print("next steps:")
    print(f"  1. implement the logic in {rel_script}")
    print(f"  2. cat {payload.relative_to(REPO_ROOT)} | uv run {rel_script}   # manual run")
    print("  3. uv run scripts/test_hooks.py                # full smoke suite")
    print("  4. claude plugin validate ./plugins/skoghooks  # manifest check")
    print("  5. document the hook in plugins/skoghooks/README.md and CLAUDE.md")
    sys.exit(0)


if __name__ == "__main__":
    main()
