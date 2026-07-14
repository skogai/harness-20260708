---
permalink: harness/claude
type: router
---

<routes>

- @SKOGAI.md

</routes>

## Quick facts

- Setup: `mise trust && mise install`. Run everything with `mise run check` (runs `test`, `test:py`, `test:skogharness`).
- No root README, no CI config, no linter — `mise.toml` is the only build/task orchestrator in the repo.
- `skogharness/` is a self-contained `uv`/Python 3.14 package (entry point `skogharness`). Test it alone with `mise run test:skogharness` (`uv run --extra dev pytest`, dir `skogharness`).
- `.example/` is reference material only — never edit it; `skogharness/` is the real implementation target it mirrors.
- Do not modify the `harness-creator` skill under `skogharness/src/skogharness/skills/harness-creator/`.
- `skogharness install <category>` (`agents|commands|hooks|mcp|modes|skills`) has real safety behavior, not just docs: it refuses to install into its own source tree (or an ancestor/descendant of it) and writes to a staging dir before an atomic rename — don't try to "simplify" this away.
- Only the `skills` category has production content. `agents/commands/hooks/mcp/modes` are intentionally inert example placeholders — e.g. `hooks/hooks.json` references a script that doesn't exist, by design.
