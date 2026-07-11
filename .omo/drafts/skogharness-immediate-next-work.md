---
slug: skogharness-immediate-next-work
status: drafting
intent: clear
pending-action: write .omo/plans/skogharness-immediate-next-work.md
approach: "Plan the immediate next work as a preservation-first staged-worktree reconciliation: document what is staged, verify whether generated outputs are reproducible from current source surfaces, repair only through source/generator paths, and leave product feature work deferred until the repo has a coherent baseline."
---

# Draft: skogharness-immediate-next-work

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->
1. staged-worktree-triage | classify the 46 staged paths and identify source vs generated surfaces | active | `.omo/evidence/task-1-skogharness-immediate-next-work.md`
2. argc-bootstrap-surface | determine whether staged removals of `Argcfile.sh`, `agents`, and `argc` are intentional or break the command surface | active | `.omo/evidence/task-2-skogharness-immediate-next-work.md`
3. generated-tool-regeneration | prove whether `bin/*` and `functions.json` changes are reproducible from current source/generator inputs | active | `.omo/evidence/task-3-skogharness-immediate-next-work.md`
4. validation-baseline | run current repo validation commands and separate real blockers from expected failures caused by staged state | active | `.omo/evidence/task-4-skogharness-immediate-next-work.md`
5. handoff-decision | produce a commit-or-repair recommendation with exact next command and no product feature scope | active | `.omo/evidence/task-5-skogharness-immediate-next-work.md`

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->
1. staged changes are user/agent work and must be preserved until proven accidental | do not reset or restore staged paths during planning | repo instructions forbid reverting user changes; staged generated changes may be intentional output from a setup step | yes, by explicit user approval later
2. immediate next work is repo integrity, not lifecycle feature implementation | defer `harness brief` / `harness verify` coding | current checkout uses `src-js/`, lacks `bin/cli.js`, and has staged bootstrap/generated changes, so old implementation plans are stale | yes
3. `Argcfile.sh` and `argc/` are command-surface dependencies until proven replaced | treat their staged deletion as a high-priority risk | AGENTS.md says `Argcfile.sh` owns build/check/test command definitions and `argc/` owns command/tool ecosystem | yes
4. generated `bin/` wrappers are not primary edit surfaces | inspect generator/source inputs before touching wrappers | AGENTS.md explicitly says not to edit generated `bin/` wrappers by hand | yes

## Findings (cited - path:lines)
- `AGENTS.md` identifies the current runtime source root as `src-js/`, not the previous `src/`, and lists `Argcfile.sh`, `argc/`, `bin/`, `functions.json`, and `mcp.json` as core surfaces.
- `AGENTS.md` says `Argcfile.sh` owns build/check/test command definitions and `argc/` owns configured argc tools and MCP bridges.
- `AGENTS.md` says not to hand-edit generated `bin/` wrappers and not to treat `.skogai/` mirrors as primary implementation surfaces.
- `package.json` has no `lint` script, while `prepublishOnly` invokes `bun run lint`; the AGENTS notes warn not to use `prepublishOnly` as a green validation signal without addressing the mismatch.
- `git status --short --branch --untracked-files=all` reports `master...origin/master [ahead 1]` with 46 staged paths: deleted `Argcfile.sh`, deleted `agents`, deleted `argc`, many modified `bin/*`, modified `functions.json`, and modified `mise.toml`.
- `git diff --cached --stat` shows the staged set has 54 insertions and 1223 deletions, with most deletion volume in `functions.json`.
- `git diff --cached -- bin/all bin/code_interpreter bin/demo_py` shows wrapper paths were rewritten from `/home/skogix/dev/harness/skogix-cleanup-restart/...` to `/home/skogix/harness/...`.
- `.omo/drafts/skogharness-immediate-next-work.md` and `.omo/plans/skogharness-immediate-next-work.md` were created by the `ulw-plan` scaffold script.

## Decisions (with rationale)
- Plan the next work as worktree reconciliation first. Rationale: source-feature work is unsafe until generated/bootstrap state is classified and current validation surfaces are known.
- Preserve the staged state during planning. Rationale: the staged diff may be the output of a generator or setup step, and reverting it would violate shared-worktree discipline.
- Require generator/source proof before accepting or editing generated `bin/*` and `functions.json`. Rationale: generated artifacts are not primary implementation surfaces in this checkout.
- Treat the old July 8 Superpowers plan as stale reference only. Rationale: it targeted `src/`, `bin/cli.js`, and template surfaces that no longer match the current AGENTS.md.

## Scope IN
- Triage the current staged changes.
- Verify whether staged generated output is reproducible from current source/generator surfaces.
- Validate current command surfaces using the commands listed in AGENTS.md where available.
- Produce an evidence-backed recommendation for commit, repair, or defer.
- Keep all planning artifacts under `.omo/`.

## Scope OUT (Must NOT have)
- No product feature implementation.
- No edits to `src-js/`, `scripts/`, `schemas/`, generated `bin/`, `functions.json`, `mise.toml`, `Argcfile.sh`, `agents`, or `argc` as part of this planning step.
- No `git reset`, `git restore`, checkout, or revert of staged/user changes without explicit later approval.
- No hand edits under `.skogai/`, `.claude/`, `.mcp.json`, `tmp/`, mirrored templates, or generated wrappers.
- No claim that the repo is clean or ready until validation evidence proves it.

## Open questions
- None for plan generation. The adopted default is preservation-first reconciliation before feature work.

## Approval gate
status: approved-by-current-goal
pending-action: write .omo/plans/skogharness-immediate-next-work.md
approval-evidence: The active objective is "Use omo:ulw-plan to plan the immediate next work for the skogharness repository." No product-code execution is included.
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
