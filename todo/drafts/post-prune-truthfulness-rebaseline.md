---
slug: post-prune-truthfulness-rebaseline
status: awaiting-approval
intent: unclear
review_required: false
automatic_review: dual-high-accuracy-after-approval
pending-action: write .omo/plans/post-prune-truthfulness-rebaseline.md
approach: "Create a narrow truthfulness rebaseline for current master: align live entrypoints with tracked HEAD, preserve and label historical planning without rewriting it, add a minimal current owner-pending state note, and establish one fail-closed repo-local structural validation gate."
---

# Draft: post-prune-truthfulness-rebaseline

## Components (topology ledger)

1. live-entrypoint-truth | make root agent/docs routing describe only tracked current surfaces | active | `.omo/evidence/task-entrypoints.md`
2. planning-provenance | preserve both existing planning trees and mark them historical/non-authoritative | active | `.omo/evidence/task-planning-provenance.md`
3. current-decision-state | add one minimal live record that product boundary and CLI restoration remain owner-pending | active | `.omo/evidence/task-current-state.md`
4. repository-validation-gate | provide one repo-local fail-closed structural check and wire it into the default check surface | active | `.omo/evidence/task-validation-gate.md`
5. lifecycle-and-cli-features | restore/build runtime, lifecycle commands, hooks, or release packaging | deferred | owner decision after rebaseline

## Open assumptions (announced defaults)

1. Current `master` is the execution baseline for this work unit | describe the slim tracked tree truthfully but do not declare it the permanent product | `master` is clean at `origin/master`, while no current plan authorizes restoring deleted runtime | reversible by later owner decision and Git history
2. Existing planning contains useful intent but is not executable truth | preserve both copies verbatim and label them historical/non-authoritative instead of deleting or rewriting them | they are byte-identical and target absent paths | reversible
3. The first validation gate should prove repository structure, not recreate a package runtime | fail on missing/stale routes, zero assertions, warnings/skips, global paths, ignored/generated inputs, and nonexistent documented commands | current `mise run check` is false-green and other validators escape repo scope | reversible and extensible
4. CLI restoration and lifecycle design remain out of scope | record them as owner-pending, not rejected | choosing either would silently decide the durable product boundary | reversible
5. Concurrent docs edits belong to the user | preserve the current modular-automation additions byte-for-byte and plan around them | they appeared after the read-only audit and overlap the docs surface | reversible only by the user

## Findings (cited - path:lines)

- `AGENTS.md:3-9,20-31,38-56,78-91` identifies an older commit/branch and routes to deleted Node/CLI/generated surfaces.
- `docs/README.md:3-4,11-20` describes a rebuild knowledge-extraction stage, archives the previous generation, and calls the duplicated GSD tree active.
- `docs/what-is-a-harness.md:79-106` describes the remaining direction as a blueprint-generation framework, but does not settle whether the old CLI should return.
- `.skogix/todo/gsd-planning/STATE.md:5-17,24-36,66-90` claims Phase 1 CLI planning and references nonexistent `.planning/` paths; it is byte-identical to `.skogix/.old-planning-example/`.
- `.skogix/todo/gsd-planning/PROJECT.md:5-19,31-47` assumes a Bun/Node CLI, absent `src/commands/`, `init.sh`, and `.planning/` sources.
- `mise.toml:26-45` lets `mise run check` pass with a zero-test Node leg and excludes schema/skill checks.
- `scripts/check-skills.sh:6-19` resolves two directories above the repo script and validates global `.claude/skills` rather than tracked repo skills.
- `scripts/validate-schema.sh:67-106` scans broadly, treats warnings as non-failures, and has no nonzero-pass assertion.
- Live verification: `mise run check` exited 0 with 0 Node tests and 25 Python tests; `mise run check:schema` exited 1 with 17 checked, 0 passed, 2 failed, 15 warned.
- Initial Git verification: `master` began clean at `origin/master`; HEAD `35f6153` committed deletion of the package/runtime/test surfaces. The remote `.omo` plan describes an earlier staged state and is stale for current master.
- Dirty-worktree update after exploration: `docs/README.md`, `docs/harness/pattern-language.md`, and `docs/what-is-a-harness.md` became modified and `docs/harness/modular-automation-pattern.md` appeared untracked. Those changes are protected user work and must be integrated without overwrite; only `.omo/drafts/post-prune-truthfulness-rebaseline.md` belongs to this planning turn.

## Decisions (with rationale)

- Plan the smallest truthfulness rebaseline, not a CLI restoration or blueprint MVP. This removes false claims without preempting the owner's product decision.
- Preserve both historical planning trees exactly. Provenance is more valuable than making stale state look current.
- Add a minimal live decision/state record rather than repurposing the copied GSD plan. The new record must explicitly say which decisions remain owner-pending.
- Require repository-local, tracked-input validation and reject zero-test/vacuous/global-state success. A green gate must prove something about this checkout.
- Defer comprehensive CI, all schema cleanup, lifecycle commands, hooks, runtime/package restoration, and generated artifact work until the product boundary is chosen.

## Scope IN

- Truthful root agent entrypoints and docs navigation for the tracked current tree.
- Explicit historical/non-authoritative labels and routing for the two existing planning copies, without content rewrites.
- One minimal current state/decision artifact under the repo's chosen live planning surface.
- One fail-closed repo-local structural validation command integrated into `mise run check`.
- Automated positive and negative fixtures proving the gate cannot pass on zero candidates, stale routes, missing commands, warnings/skips, global paths, ignored files, or generated inputs.
- Repository-owned ignore policy sufficient to keep local environments, secrets, caches, and generated evidence out of Git.
- Explicit preservation assertions for the concurrent modular-automation documentation diff before and after every task that touches overlapping docs.

## Scope OUT (Must NOT have)

- No restore, checkout, reset, cherry-pick, or bulk resurrection of deleted CLI/runtime/package files.
- No declaration that docs/schemas/skills is the permanent product boundary.
- No deletion or semantic rewrite of `.skogix/todo/gsd-planning/`, `.skogix/.old-planning-example/`, or `docs/archive/`.
- No implementation of `harness brief`, `harness verify`, lifecycle hooks, manifest/profile resolution, packaging, or release CI.
- No validation dependency on `~/.claude`, global `argc`, ignored worktree files, generated snapshots, or worker self-report.
- No acceptance based only on grep hits or a zero-test/zero-candidate command.
- No overwrite, deletion, reformat, or semantic rollback of the current modular-automation additions in `docs/README.md`, `docs/harness/pattern-language.md`, `docs/what-is-a-harness.md`, or `docs/harness/modular-automation-pattern.md`.

## Open questions

- None required to write this narrow plan. The durable product boundary and CLI restoration remain explicitly owner-pending for a later decision.

## Approval gate

status: awaiting-approval
pending-action: run scaffold-plan for `.omo/plans/post-prune-truthfulness-rebaseline.md`, perform mandatory Metis gap analysis, write the decision-complete plan, then run the automatic dual high-accuracy review
approval-evidence: pending explicit user acceptance of the derived approach
