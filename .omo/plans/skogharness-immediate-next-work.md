# skogharness-immediate-next-work - Work Plan

## TL;DR (For humans)
**What you'll get:** A short, evidence-backed reconciliation pass for the current staged repository state. It will tell us whether the staged generated/bootstrap changes are coherent, what command surface is actually available, and whether the next action should be commit, repair, or stop for human direction.

**Why this approach:** The checkout currently has staged deletions and generated-output changes on core command surfaces. The safest immediate move is to preserve that work, prove where it came from, and avoid feature implementation until the baseline is no longer slippery.

**What it will NOT do:** It will not reset or revert staged work, implement lifecycle hooks, edit generated wrappers by hand, or treat mirrored harness directories as source.

**Effort:** Short
**Risk:** Medium - staged command-surface deletions may be intentional, but they also may break validation and tool generation.
**Decisions to sanity-check:** Preservation-first is the default; if the staged deletions are known intentional from outside this session, execution can skip directly to validation and commit preparation.

Your next move: start execution of this plan with a worker, or request a high-accuracy review first. Full execution detail follows below.

---

> TL;DR (machine): Short, medium-risk reconciliation plan for staged generated/bootstrap changes before any new skogharness feature work.

## Scope
### Must have
- Preserve the current staged worktree until evidence proves a narrower action is safe.
- Classify every currently staged path into source, symlink/bootstrap, generated wrapper, generated declaration, or environment setup.
- Verify whether the staged `bin/*` and `functions.json` changes are reproducible from the current source/generator surface.
- Verify whether deleting `Argcfile.sh`, `agents`, and `argc` leaves the documented `argc build` and `argc test` surfaces usable.
- Produce one final recommendation: commit as coherent generated/bootstrap output, repair through generator/source paths, or stop and ask the user about a destructive/unrecoverable action.
- Record command output and observations under `.omo/evidence/`.
### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do not run `git reset`, `git restore`, `git checkout`, or any revert command against staged changes.
- Do not edit generated `bin/` wrappers by hand.
- Do not edit through the `agents` symlink or under `.skogai/`, `.skogix/`, `.old/`, `.omo/run-continuation`, `.claude/`, `.mcp.json`, or `tmp/`.
- Do not implement `harness brief`, `harness verify`, hooks, or schema changes in this work unit.
- Do not use `bun run lint` or `prepublishOnly` as a green signal unless the missing lint script mismatch is first addressed in a separate approved work unit.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after, because this plan audits an existing staged repository state rather than adding behavior.
- Evidence: `.omo/evidence/task-<N>-skogharness-immediate-next-work.md` for each todo, plus raw command output excerpts embedded in each evidence file.

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.
- Wave 1: todo 1, todo 2, and todo 3 can run in parallel because they only inspect staged state, command availability, and generation inputs.
- Wave 2: todo 4 and todo 5 depend on Wave 1 classifications and run validation/regeneration checks without editing product files.
- Wave 3: todo 6 synthesizes the recommendation and prepares the next execution handoff.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Staged state inventory | none | 4, 6 | 2, 3 |
| 2. Command surface check | none | 4, 6 | 1, 3 |
| 3. Generator/source ownership check | none | 4, 5, 6 | 1, 2 |
| 4. Validation baseline | 1, 2 | 6 | 5 |
| 5. Generated output reproducibility probe | 1, 3 | 6 | 4 |
| 6. Recommendation and handoff | 1, 2, 3, 4, 5 | final verification | none |

## Todos
> Implementation + Test = ONE todo. Never separate.
- [ ] 1. Inventory staged worktree state
  What to do / Must NOT do: Record the exact staged paths, their file kind, and whether each is documented as source or generated. Do not change staging and do not inspect through `.skogai/` mirrors except to identify symlink targets.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 4, 6
  References (executor has NO interview context - be exhaustive): `AGENTS.md` sections `STRUCTURE`, `WHERE TO LOOK`, `ANTI-PATTERNS`; `git diff --cached --name-status`; `git diff --cached --stat`; `git ls-files -s Argcfile.sh agents argc bin/all functions.json mise.toml`
  Acceptance criteria (agent-executable): create `.omo/evidence/task-1-skogharness-immediate-next-work.md` containing a table of all 46 staged paths grouped as symlink/bootstrap, generated wrapper, generated declaration, or environment setup, and include the exact command outputs used.
  QA scenarios (name the exact tool + invocation): happy: `git diff --cached --name-status | wc -l` matches the table count; failure: if counts differ, rerun `git status --porcelain=v1` and mark the evidence file `FAILED: inventory mismatch`. Evidence `.omo/evidence/task-1-skogharness-immediate-next-work.md`
  Commit: N | planning/evidence only

- [ ] 2. Check command surface availability
  What to do / Must NOT do: Determine whether `argc`, `argc build`, and `argc test` are currently runnable with the staged deletion of `Argcfile.sh`, `agents`, and `argc`. Do not restore deleted files and do not install new global tools.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 4, 6
  References (executor has NO interview context - be exhaustive): `AGENTS.md` command list; `package.json` scripts; staged deletions from `git diff --cached --name-status`
  Acceptance criteria (agent-executable): create `.omo/evidence/task-2-skogharness-immediate-next-work.md` with outputs for `command -v argc`, `argc --help`, `argc build --help` if available, `argc test --help` if available, and a clear pass/fail line for whether the documented command surface exists.
  QA scenarios (name the exact tool + invocation): happy: `argc --help` exits 0 and evidence records available commands; failure: `argc` or subcommands are unavailable and evidence records exact stderr/status without attempting repair. Evidence `.omo/evidence/task-2-skogharness-immediate-next-work.md`
  Commit: N | planning/evidence only

- [ ] 3. Identify generator and source ownership for generated outputs
  What to do / Must NOT do: Locate the source/generator that owns `bin/*` wrappers and `functions.json`. Do not edit wrappers or declarations. If ownership is ambiguous after two searches, record ambiguity as a blocker rather than guessing.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 4, 5, 6
  References (executor has NO interview context - be exhaustive): `AGENTS.md` anti-pattern "Do not edit generated bin wrappers by hand"; `rg -n "functions.json|run-tool|Argcfile|generated|bin/" . --glob '!node_modules/**' --glob '!.git/**' --glob '!.skogai/**'`; `git log --oneline -- bin/all functions.json mise.toml Argcfile.sh`
  Acceptance criteria (agent-executable): create `.omo/evidence/task-3-skogharness-immediate-next-work.md` naming the generator/source candidates, exact files searched, and whether the current staged output can be attributed to a known command or remains unexplained.
  QA scenarios (name the exact tool + invocation): happy: at least one generator command or source file is identified with path and command evidence; failure: no generator is found after the specified searches, and evidence marks generated-output ownership as unresolved. Evidence `.omo/evidence/task-3-skogharness-immediate-next-work.md`
  Commit: N | planning/evidence only

- [ ] 4. Run current validation baseline without repairing
  What to do / Must NOT do: Run validation commands that are available in the current checkout and record exact status. Do not fix failures in this todo. Do not run `prepublishOnly`.
  Parallelization: Wave 2 | Blocked by: 1, 2 | Blocks: 6
  References (executor has NO interview context - be exhaustive): `AGENTS.md` command list; `scripts/AGENTS.md` validation list; `src-js/AGENTS.md` validation list; `package.json` scripts
  Acceptance criteria (agent-executable): create `.omo/evidence/task-4-skogharness-immediate-next-work.md` with command, exit code, and concise output for `bun run test`, `bun run test:security`, `./scripts/validate-schema.sh`, Python validator tests listed in `scripts/AGENTS.md`, and `argc build` / `argc test` only if todo 2 proves the command surface exists.
  QA scenarios (name the exact tool + invocation): happy: every available validation command is recorded with exit code and key output; failure: unavailable commands are recorded as `SKIPPED: unavailable` with evidence from todo 2, not silently omitted. Evidence `.omo/evidence/task-4-skogharness-immediate-next-work.md`
  Commit: N | planning/evidence only

- [ ] 5. Probe generated output reproducibility
  What to do / Must NOT do: If todo 3 identifies a generator command, run it in the least destructive documented mode and compare output to the staged diff. Do not hand-edit generated files. If the generator writes tracked files, capture before/after diff and stop without staging additional changes unless the command is documented as the normal build surface.
  Parallelization: Wave 2 | Blocked by: 1, 3 | Blocks: 6
  References (executor has NO interview context - be exhaustive): generator/source evidence from todo 3; `AGENTS.md` generated-wrapper anti-pattern; `git diff --cached -- bin functions.json`; `git diff -- bin functions.json`
  Acceptance criteria (agent-executable): create `.omo/evidence/task-5-skogharness-immediate-next-work.md` stating whether current generated changes are reproducible, partially reproducible, or unexplained, with command output and post-command `git diff --cached --stat` / `git diff --stat`.
  QA scenarios (name the exact tool + invocation): happy: generator output matches or explains staged changes; failure: generator unavailable or output diverges, and evidence records exact divergence and recommends repair through source/generator path. Evidence `.omo/evidence/task-5-skogharness-immediate-next-work.md`
  Commit: N | planning/evidence only

- [ ] 6. Produce recommendation and next-work handoff
  What to do / Must NOT do: Synthesize todos 1-5 into one immediate next action: commit staged changes, repair through generator/source, or ask the user before destructive recovery. Do not execute the recommendation inside this todo.
  Parallelization: Wave 3 | Blocked by: 1, 2, 3, 4, 5 | Blocks: final verification
  References (executor has NO interview context - be exhaustive): `.omo/evidence/task-1-skogharness-immediate-next-work.md` through `.omo/evidence/task-5-skogharness-immediate-next-work.md`; current `git status --short --branch --untracked-files=all`
  Acceptance criteria (agent-executable): create `.omo/evidence/task-6-skogharness-immediate-next-work.md` with a one-page recommendation, exact next command(s), risks left open, and paths that must remain untouched.
  QA scenarios (name the exact tool + invocation): happy: recommendation names exactly one next action and cites evidence files; failure: if evidence conflicts, recommendation is `STOP: ask user` with the precise destructive or owner decision required. Evidence `.omo/evidence/task-6-skogharness-immediate-next-work.md`
  Commit: N | planning/evidence only

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit: read `.omo/evidence/task-1-skogharness-immediate-next-work.md` through `.omo/evidence/task-6-skogharness-immediate-next-work.md` and confirm every Must Have has direct evidence.
- [ ] F2. Code quality review: confirm no product-code files were modified by this planning/execution pass except evidence under `.omo/evidence/`.
- [ ] F3. Real manual QA: run the command surface named by the recommendation in dry-run/help/status mode, not a grep-only check, and record output in `.omo/evidence/f3-skogharness-immediate-next-work.md`.
- [ ] F4. Scope fidelity: run `git status --short --branch --untracked-files=all` and verify no forbidden paths were changed beyond `.omo/evidence/` and existing staged work.

## Commit strategy
- No commit during planning.
- During execution, commit only after the final recommendation is approved and only if the recommendation is "commit staged changes".
- If a commit happens later, stage exactly the coherent work unit identified by the recommendation; do not include `.omo/evidence/` unless the user wants planning/evidence artifacts committed.

## Success criteria
- The Omo plan exists at `.omo/plans/skogharness-immediate-next-work.md`.
- The executor can run the plan without asking where to inspect or which commands to try.
- Every todo has references, acceptance criteria, happy/failure QA, and evidence paths.
- The plan does not require reverting user changes.
- The plan explicitly defers feature work until the current staged baseline is understood.
