#!/usr/bin/env bash

# workflow-memory.sh — Shared workflow artifact pathing + persistence helpers.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

skogai_workflow_root() {
  local root
  if [[ -n "${SKOGAI_WORKFLOW_DIR:-}" ]]; then
    root="${SKOGAI_WORKFLOW_DIR}"
    if [[ "$root" != /* ]]; then
      root="$(cd "$(pwd)" && pwd)/$root"
    fi
    printf '%s\n' "$root"
    return
  fi
  # Use shared root discovery
  local agent_root_script="$SCRIPT_DIR/context/find-agent-root.sh"
  if [[ -x "$agent_root_script" ]]; then
    root="$("$agent_root_script")"
    printf '%s\n' "$root"
    return
  fi
  # Fallback
  root="$(cd "$(pwd)" && pwd)/.planning/workflow"
  printf '%s\n' "$root"
}

skogai_workflow_init() {
  local root
  root="$(skogai_workflow_root)"
  mkdir -p "$root"

  local now
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  local tpl_dir="$SCRIPT_DIR/templates/workflow"

  local tasks_file="$root/tasks-progress.md"
  local research_file="$root/research-notes.md"
  local decisions_file="$root/decisions-results.md"

  if [[ ! -f "$tasks_file" ]]; then
    if [[ -f "$tpl_dir/tasks-progress.md.tpl" ]]; then
      sed "s/{{created_utc}}/$now/g" "$tpl_dir/tasks-progress.md.tpl" > "$tasks_file"
    else
      cat > "$tasks_file" <<EOF
# Workflow Tasks Progress

Created (UTC): $now

Current Step:

Remaining Steps:

Completion Target:

## Progress Log
EOF
    fi
  fi

  if [[ ! -f "$research_file" ]]; then
    if [[ -f "$tpl_dir/research-notes.md.tpl" ]]; then
      sed "s/{{created_utc}}/$now/g" "$tpl_dir/research-notes.md.tpl" > "$research_file"
    else
      cat > "$research_file" <<EOF
# Workflow Research Notes

Created (UTC): $now

## Findings
EOF
    fi
  fi

  if [[ ! -f "$decisions_file" ]]; then
    if [[ -f "$tpl_dir/decisions-results.md.tpl" ]]; then
      sed "s/{{created_utc}}/$now/g" "$tpl_dir/decisions-results.md.tpl" > "$decisions_file"
    else
      cat > "$decisions_file" <<EOF
# Workflow Decisions & Results

Created (UTC): $now

## Decisions
EOF
    fi
  fi
}

skogai_workflow_append_progress() {
  local raw_tool_name="${1:-}"
  local raw_tool_use_id="${2:-}"
  local tool_name tool_use_id now root tasks_file

  tool_name="$(printf '%s' "$raw_tool_name" | tr '\n\r' '  ')"
  tool_name="${tool_name:-unknown}"
  tool_use_id="$(printf '%s' "$raw_tool_use_id" | tr '\n\r' '  ')"
  tool_use_id="${tool_use_id:-none}"

  root="$(skogai_workflow_root)"
  tasks_file="$root/tasks-progress.md"
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  if [[ ! -f "$tasks_file" ]]; then
    skogai_workflow_init
  fi

  printf -- '- %s | tool=%s | tool_use_id=%s\n' "$now" "$tool_name" "$tool_use_id" >> "$tasks_file"
}
