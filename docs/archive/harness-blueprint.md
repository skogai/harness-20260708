# skogharness agentic system - harness blueprint

Blueprint for the agentic system this repository installs and governs. The
delegated job is **feature/progress/planning**: an agent picks one feature,
implements it, verifies it, records evidence, and hands off so the next session
can restart cold.

Sibling docs: [`implementation.md`](./implementation.md) (design rationale),
[`features.md`](./features.md) (feature status), [`specs.md`](./specs.md)
(baseline facts). This doc is the harness-level architecture that ties them
together.

## 0. Structural Read

Honest framing first: **skogharness does not run the model turn loop.** That
loop is executed by the host agent (Claude Code or Codex). This repo owns the
governance around that loop:

- **Config plane** — `skogai.json` → `harness sync` → native agent config
  (skills, MCP servers, settings managed blocks). Drift detection via
  `harness status`.
- **State plane** — `harness harness-init` scaffolds `feature_list.json`,
  `progress.md`, `session-handoff.md`, `init.sh`.
- **Instruction plane** — `AGENTS.md`/`CLAUDE.md` with startup workflow,
  scope control, definition of done, end-of-session rules.
- **Audit plane** — `harness-creator` skill with `validate-harness.mjs`
  (five-subsystem scoring).

Current structural weaknesses, in priority order:

1. **Evidence is self-reported.** `feature_list.json` evidence fields are
   prose written by the agent that did the work. Nothing re-runs the recorded
   command and checks the exit code.
2. **No permission map.** Hooks exist (`secret-scanner.sh` etc.) but nothing
   binds risk tiers to actions; the host's default permission prompts are the
   only gate.
3. **The session loop is instruction-only.** Startup, scope, and handoff live
   in `AGENTS.md` prose. If the agent skips a step, nothing notices until the
   next human reads `progress.md`.
4. **No machine-readable stop conditions.** "One feature at a time" and
   "document blockers" are norms, not checks.

The build order in §10 addresses these in sequence.

## 1. System Goal and Delegation Boundary

**Delegated to the agent:** select the next unblocked feature from
`feature_list.json`, implement it within scope, run verification, update
state files with evidence, and leave a restartable handoff.

**Retained by the human:** defining and prioritizing features, approving
merges to `master`, editing the manifest contract (`skogai.json`), and
resolving blockers the agent records.

**Success:** any fresh session (or different agent) can run `./init.sh`, read
three files, and continue the work without re-deriving context — and every
"done" status is backed by a verification command that actually passed.

## 2. Harness Layers

| Layer | Owner | Artifact |
|---|---|---|
| Host / interface | Claude Code / Codex | terminal, transcripts, permission UI |
| Request assembly | this repo | `CLAUDE.md` → `AGENTS.md`, synced settings, skills |
| Execution loop | host (inner), this repo (outer) | host tool loop; session lifecycle loop below |
| Tool runtime | this repo + host | `skogai.json` manifest, MCP config, hooks |
| Memory / context | this repo | `feature_list.json`, `progress.md`, docs/ |
| Transcript / recovery | this repo | `session-handoff.md`, git history |
| Extension | this repo | skills, MCP catalog, profiles |

The division of labor: the host provides the model, the inner tool loop, and
per-turn context management. skogharness provides the material that must survive
the host: durable state files, verification entrypoints, and the manifest
contract that regenerates native config on any machine.

## 3. Request Assembly Design

Instruction sources, from durable to per-turn:

1. **Durable, human-authored:** `AGENTS.md` (startup workflow, scope,
   definition of done), referenced from `CLAUDE.md`. Never generated.
2. **Durable, generated:** managed blocks written by `harness sync` into
   native config (`.mcp.json`, Claude settings, Codex TOML/`AGENTS.md`
   blocks). Reproducible from `skogai.json`; drift is an error surfaced by
   `harness status`.
3. **Per-session state:** `feature_list.json`, `progress.md`,
   `session-handoff.md` — read at startup per the workflow, not injected
   automatically.
4. **Per-turn:** host-managed transcript and tool results.

Rule: anything an agent must know to restart lives in layer 1–3 files, never
only in a host transcript. The manifest is the source of truth for layer 2;
hand edits to generated files are drift, not configuration.

Known gap: layer 3 is pull-based (the agent must remember to read it). A
session-start hook that prints the active feature and open blockers would
convert the convention into a mechanism.

## 4. Turn Loop Design

Two nested loops. The **inner loop** (gather → act → verify per tool call)
belongs to the host and is out of scope here. The **outer loop** is the
session lifecycle this harness owns:

```
1. INIT      ./init.sh                    — install, lint, test, harness audit
2. ORIENT    read feature_list.json, progress.md, session-handoff.md
3. SELECT    pick ONE feature: status != done, all dependencies done
4. PLAN      record intent before editing code when the feature is non-trivial
5. ACT       implement, scoped to the selected feature
6. VERIFY    re-run ./init.sh (or the focused command for docs-only work)
7. RECORD    update feature status + evidence, progress.md, decisions
8. EXIT      update session-handoff.md: blockers, risks, next step
```

**Stop conditions** (end the session or escalate rather than continue):

- verification fails twice on the same cause → record blocker, stop
- the fix requires touching files outside the feature's scope → record the
  scope conflict as a blocker or a new feature entry, stop
- a dependency feature turns out to be incomplete → mark it, reselect or stop
- context is degrading (repeated re-reading, contradictory edits) → write
  handoff early; a fresh session with clean state beats a long confused one

**Retry policy:** one retry per failing verification with a changed
hypothesis. Never loop on `init.sh` hoping for a different result; never
weaken a check to make it pass (that is a feature-level decision for the
human).

**Compaction trigger:** the outer loop treats host compaction as a possible
interruption. Steps 7-8 must be current enough at all times that losing the
transcript loses nothing but the current step's work-in-progress.

## 5. Tool and Capability Runtime

Tools enter through one door: `skogai.json`. `harness add mcp|skill`
mutates the manifest, `harness sync` projects it into native config,
`harness status` detects bypasses. This is the capability plane — a tool that
isn't in the manifest isn't part of the runtime.

Governance that already exists:

- `src/utils/security.js` — path traversal, skill-path, and command-name
  validation; log sanitizing.
- `src/utils/managed-block.js` — generated config is idempotent and marked,
  so human and machine edits can't silently collide.
- `src/utils/copy.js` — rejects symlinks when installing templates.
- `templates/.claude/hooks/` — `secret-scanner.sh`, `file-size-monitor.sh`,
  `markdown-formatter.sh`, `settings-backup.sh` as host hook points.

Permission tiers (target design — today only the host's defaults apply):

| Tier | Actions | Gate |
|---|---|---|
| read | read files, `harness status`, run tests | none |
| write | edit code/docs within selected feature scope | scope check (§4) |
| state | mutate `feature_list.json`, `progress.md`, handoff | must cite a verification result |
| config | edit `skogai.json`, re-sync | human review before merge |
| destructive | delete files, force-push, weaken checks | explicit human approval, never in auto mode |

**Success criteria per tool class:** a tool call succeeded when its effect is
observable by a later check — code edits by `./init.sh`, config edits by
`harness status` exiting 0, state edits by `validate-harness.mjs` scoring.
"The command printed no error" is not success evidence.

**Error handling:** tool failures are data, recorded in `progress.md` when
they change the plan. A failed sync or failed test must never be papered over
by editing the expected output.

## 6. Context and Memory Model

| Layer | Artifact | Rewrite policy |
|---|---|---|
| turn context | host transcript | host-managed, assumed lossy |
| working memory | `progress.md` | append/update freely each session |
| task state | `feature_list.json` | status/evidence only; feature definitions are human-owned |
| durable contract | `skogai.json`, `AGENTS.md`, `docs/` | change = reviewed commit |
| compaction artifact | `session-handoff.md` | rewritten each session end; only current handoff kept |

Boundaries: nothing durable lives only in the transcript; nothing transient
(per-turn reasoning) is written to state files. `docs/features.md` is the
slower-moving design-level view of the feature system, while
`feature_list.json` is the session tracker allowed to churn.

## 7. Permissions and Safety Gates

- **Approval points:** manifest changes and merges to `master` (human);
  destructive actions (explicit approval, §5).
- **Destructive-action policy:** no force-push, no deleting state files, no
  disabling or weakening verification commands. `harness-init` refuses to
  overwrite existing state files without `--force`.
- **Isolation assumption:** the agent operates in a git worktree/branch;
  `master` changes only via reviewed merge. Recorded precedent: feat-004 was
  squash-merged from a worktree, and the worktree confusion it caused is why
  branch/commit now must be named in `session-handoff.md`.
- **Secrets:** placeholder env vars (`${GITHUB_PERSONAL_ACCESS_TOKEN}`
  style) in the manifest; `secret-scanner.sh` as the hook backstop; real
  tokens never in generated or committed files.
- **Auditability:** every state mutation is a diff in git; managed blocks
  make generated-vs-human content distinguishable in every synced file.

## 8. Transcript and Recovery Model

The **semantic transcript spine** is the trio of state files plus git
history — not the host transcript, which is treated as disposable:

- *what was done* → `progress.md` + commit history
- *what it means for the task* → `feature_list.json` status + evidence
- *what happens next* → `session-handoff.md`

**Recovery flow** for any interruption (crash, compaction, new machine, new
agent): clone or open the repo; `harness sync` regenerates native config from
the manifest when needed; `./init.sh` proves the environment; read the three
state files; resume at step 3 of the outer loop. Partial work survives as a
branch or uncommitted diff; if it cannot be verified, the handoff says so and
the next session decides to finish or discard it.

**Invariant:** at any commit on a working branch, the state files must be
accurate enough that this flow works. That is the real definition of done for
step 7–8 of the loop.

## 9. Extension Surfaces

- **Skills** — maintained set under `templates/.claude/skills/` (currently
  `toon-formatter`, `harness-creator`), installed via manifest + sync.
- **MCP servers** — catalog in `src/mcps.js` plus custom
  `--command`/`--url` entries; all through `harness add mcp`.
- **Profiles** — `src/profiles.js` presets (`all`, `harness-meta`, `minimal`, `custom`) as
  the coarse feature gate.
- **Agent targets** — `claude`, `codex` today; a new target is a new
  projection in sync, not a new architecture.

Rule: extensions enter through the manifest and are governed by the same
sync/status/security path as everything else. A skill or MCP server dropped
directly into native config is drift by definition.

## 10. Implementation Sequence

Sequenced against the weaknesses in §0; each step is testable before the
next starts.

1. **Verification-backed evidence.** Extend the feature-list schema so
   evidence is `{command, expect_exit, last_run}` alongside prose; add
   `harness verify` (or extend `validate-harness.mjs`) to re-run recorded
   commands and fail on mismatch. This removes self-reported "done" status as
   the only evidence source.
2. **Session-start mechanism.** A hook or `harness brief` command that
   prints active feature, open blockers, and drift status at session start —
   converts the ORIENT step from convention to mechanism.
3. **Scope guard.** Cheap check comparing `git diff --name-only` against a
   per-feature path allowlist in `feature_list.json`; warn on exit when the
   diff leaks outside it.
4. **Permission tiers.** Encode §5's tier table into synced host settings
   (allow/deny/ask rules) rather than prose.
5. **Outer-loop validation.** Add harness-creator eval cases for the stop
   conditions: verification-fails-twice, scope-conflict, stale-handoff.
   Only after these pass is it safe to expand the skill/MCP surface.

Validation milestone for the whole design: a cold session on a fresh clone
completes one small feature end-to-end — including a deliberately injected
test failure — and the resulting state files pass `harness verify` without
human correction.
