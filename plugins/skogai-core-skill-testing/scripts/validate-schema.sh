#!/usr/bin/env bash
# validate-schema.sh — validate framework files against skogai JSON schemas
#
# Usage:
#   ./scripts/validate-schema.sh [ROOT]
#
# TARGET defaults to the skill root (parent of scripts/).
# Pass an explicit path to validate a different framework directory with this
# skill's schemas.
#
# Exit codes:
#   0  all files passed or warned
#   1  one or more files failed validation

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(dirname "$SCRIPT_DIR")"
TARGET_ROOT="${1:-"$SKILL_ROOT"}"
SCHEMA_DIR="$SKILL_ROOT/schemas"
HELPER="$SCRIPT_DIR/_validate_file.py"

if [[ ! -d "$SCHEMA_DIR" ]]; then
  echo "ERROR: schemas dir not found: $SCHEMA_DIR" >&2
  exit 1
fi
if [[ ! -f "$HELPER" ]]; then
  echo "ERROR: validator helper not found: $HELPER" >&2
  exit 1
fi

# ── schema overview ──────────────────────────────────────────────────────────
echo "=== skogai schema overview ==="
echo ""
echo "  schema dir: $SCHEMA_DIR"
echo "  target:     $TARGET_ROOT"
echo ""
printf "  %-35s %s\n" "schema" "maps to type"
printf "  %-35s %s\n" "------" "------------"
for f in "$SCHEMA_DIR"/*.schema.json; do
  name="$(basename "$f")"
  base="${name%.schema.json}"
  case "$base" in
    defs|document|frontmatter)
      type_val="(shared defs)"
      ;;
    list)
      type_val="list"
      ;;
    *)
      type_val="$(python3 - "$f" << 'PY'
import json, sys, warnings
warnings.filterwarnings("ignore")
s = json.load(open(sys.argv[1]))
def find_type(obj):
    if isinstance(obj, dict):
        if obj.get('properties', {}).get('type', {}).get('const'):
            return obj['properties']['type']['const']
        for v in obj.values():
            r = find_type(v)
            if r: return r
    elif isinstance(obj, list):
        for item in obj:
            r = find_type(item)
            if r: return r
    return None
t = find_type(s)
print(t if t else '(shared defs)')
PY
)"
      ;;
  esac
  printf "  %-35s %s\n" "$name" "$type_val"
done

echo ""
echo "=== validating files in: $TARGET_ROOT ==="
echo ""

# ── validate .md/.list files that have frontmatter or an XML root tag ────────
pass=0
fail=0
warn=0
total=0

while IFS= read -r -d '' file; do
  rel="${file#"$TARGET_ROOT/"}"
  [[ "$rel" == schemas/* ]] && continue
  [[ "$(basename "$file")" == "README.md" ]] && continue

  first="$(head -1 "$file")"
  [[ "$file" == *.list ]] || [[ "$first" == "---" ]] || echo "$first" | grep -qE "^<[a-z]" || continue

  total=$((total + 1))
  if result="$(uv run "$HELPER" "$SCHEMA_DIR" "$file" 2>&1)"; then
    :
  else
    :
  fi
  echo "  $result"

  case "${result:0:4}" in
    PASS) pass=$((pass + 1)) ;;
    FAIL) fail=$((fail + 1)) ;;
    WARN) warn=$((warn + 1)) ;;
  esac

done < <(find "$TARGET_ROOT" -type f \( -name "*.md" -o -name "*.list" \) -print0 | sort -z)

echo ""
echo "=== summary: $total checked | $pass passed | $fail failed | $warn warned ==="
echo ""

[[ "$fail" -eq 0 ]]
