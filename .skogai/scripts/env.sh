#!/usr/bin/env bash
set -e

# @describe Look up an environment variable from skogcli config (namespace.env.VAR)
# @arg namespace! <NAMESPACE> The skogcli namespace
# @arg var! <VAR> The environment variable name to look up
# @env LLM_OUTPUT=/dev/stdout The output path

main() {
  skogcli config get "${argc_namespace}.env.${argc_var}" --raw >>"$LLM_OUTPUT"
}

eval "$(argc --argc-eval "$0" "$@")"
