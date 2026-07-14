#!/usr/bin/env bash
# find-agent-root.sh — Discovery of the agent/workflow root directory.
# Outputs an absolute path to stdout.
# Priority: $SKOGAI_WORKFLOW_DIR > script-ancestor .skogai directory

if [[ -n "${SKOGAI_WORKFLOW_DIR:-}" ]]; then
  root="${SKOGAI_WORKFLOW_DIR}"
  if [[ "$root" != /* ]]; then
    root="$(cd "$(pwd)" && pwd)/$root"
  fi
  printf '%s\n' "$root"
  exit 0
fi

# Walk up from script dir to find .skogai
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
dir="$SCRIPT_DIR"
while [[ "$dir" != "/" ]]; do
  if [[ -d "$dir/.skogai" ]]; then
    printf '%s\n' "$dir/.planning/workflow"
    exit 0
  fi
  dir="$(dirname "$dir")"
done

# Fallback: relative to pwd
printf '%s\n' "$(cd "$(pwd)" && pwd)/.planning/workflow"
