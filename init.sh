#!/usr/bin/env bash
set -euo pipefail

echo "=== Harness startup verification ==="

if command -v bun >/dev/null 2>&1; then
  echo "=== Installing dependencies with bun ==="
  bun install

  echo "=== Running lint ==="
  bun run lint

  echo "=== Running tests ==="
  bun test
else
  echo "bun is required for the preferred project workflow."
  echo "Install bun or run the documented fallback commands manually:"
  echo "  npm test"
  exit 1
fi

echo "=== Harness validation ==="
node templates/.claude/skills/harness-creator/scripts/validate-harness.mjs --target .

echo "=== Verification complete ==="
echo "Next steps:"
echo "1. Read feature_list.json and pick one in-progress or not-started feature."
echo "2. Keep changes scoped to that feature."
echo "3. Record verification evidence in progress.md and session-handoff.md."
