#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/.." && pwd)"

cd "$repo_root"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to install the global harness executable." >&2
  echo "Activate Node with mise or nvm, then re-run this script." >&2
  exit 1
fi

if command -v bun >/dev/null 2>&1; then
  bun install --frozen-lockfile
else
  echo "bun was not found; falling back to npm install --no-package-lock." >&2
  npm install --no-package-lock
fi

npm link

if command -v harness >/dev/null 2>&1; then
  harness_path="$(command -v harness)"
  echo "Installed harness at ${harness_path}"
  echo "Try: harness --help"
else
  npm_prefix="$(npm prefix -g)"
  echo "Installed harness with npm link, but 'harness' is not on PATH." >&2
  echo "Add ${npm_prefix}/bin to PATH, then try: harness --help" >&2
fi
