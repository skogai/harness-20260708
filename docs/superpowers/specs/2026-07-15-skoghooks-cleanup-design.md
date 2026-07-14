# skoghooks cleanup — design

## Goal

Every hook script in `skoghooks` follows one contract — schema in, schema out — so that adding or changing a hook is a data change (edit a `schema.json`), not a code change. Tests are generated from the schema, never hand-written.

## Context

`skoghooks` (`marketplace/plugins/skoghooks/`) already wires all 13 Claude Code lifecycle hook events in `hooks/hooks.json`, with a shared `jsonl_log.py`/`runtime_dir.py` giving every hook a durable, cross-session log at `~/.claude/data/skoghooks.jsonl` plus a per-session copy under `/tmp/skoghooks/<session_id>/`. This part works and stays as-is.

`skogix-hooks` (a separate, parallel plugin) has a shared library, `scripts/skogai-jq.sh`, sourced by 14 of its 21 hook scripts. It gives every hook four primitives — `skogai_jq_field`, `skogai_jq_log`, `skogai_jq_context`, `skogai_jq_decision` — after doing the stdin-read/field-extraction boilerplate once. This is the pattern to reuse, not the code to port: `skoghooks` gets its own equivalent shared library, written to match its existing durable-log behavior rather than `skogai-jq.sh`'s per-session `/tmp/<session_id>.jsonl`.

`skogix-core-original/workflows/write-hook-tests.md` documents a schema-driven test generation workflow already proven inside `skoghooks` itself (the `tests/skogai-jq/skogai-jq.bats` suite the user added). Each hook gets a `tests/<hookname>/schema.json` with `examples[]` (`description`, `input`, `output`), which `skogai-jq/test-generator/transform.jq` turns into fixture files, and a `.bats` file asserts against those fixtures.

Ecosystem convention (`~/.skogai/SKOGAI.md`): no interpreted-language tooling footprint (no `package.json`/`pyproject.toml`-equivalent) at project roots unless a genuine new boundary requires it — reinforces staying inside the bash+jq pattern already established by `skogai-jq`.

## Scope

In scope: `skoghooks` only. Cleaning up its 13 event scripts to share one library, and building out schema-driven bats coverage for all of them (currently only `skogai-jq.sh`'s primitives and `user-prompt-submit` have tests).

Out of scope (separate efforts, not blocking this one):
- Touching `skogix-hooks` itself
- Merging the two plugins
- Fixing the superpowers `session-start` hook's missing durable-log entry (known gap, tracked separately — see harness memory `project_event_logging_goal.md`)

## Design

1. **Shared library** (`skoghooks/scripts/hook-lib.sh` or similar — exact name TBD at plan time): read stdin once, expose the common fields (`session_id`, `hook_event_name`, etc.), and provide field-extraction / durable-log-append / context-output / decision-output primitives — the `skogai_jq_field`/`log`/`context`/`decision` shape, but appending to `skoghooks`' existing durable + per-session log locations instead of a single `/tmp/<session_id>.jsonl`.
2. **Thin hook scripts**: each of the 13 event scripts becomes a short script that sources the shared library and contains only the logic specific to that event (e.g. `session_start.py`'s git-status/TODO context loading, `pre_tool_use.py`'s blocking checks) — no repeated stdin/logging boilerplate.
3. **Schema-driven tests**: every hook gets a `tests/<hookname>/schema.json` (examples with input/output pairs) and a generated `.bats` file, following the same generator (`test-generator/transform.jq`) already validated by the `skogai-jq.bats` suite.
4. **Contract discipline**: every hook script always exits 0 unless deliberately blocking (exit 2), same as today — this is already correct in `skoghooks` and just needs preserving through the rewrite.

## Verification

- `bats tests/**/*.bats` passes from the `skoghooks` plugin root, covering all 13 hooks (not just `skogai-jq` primitives).
- Each rewritten hook script is short enough to read in one pass — logic specific to that event only.
- No behavior regression: durable log at `~/.claude/data/skoghooks.jsonl` still receives every event with the same fields it does today.
