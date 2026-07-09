# Session Progress Log

## Current State

**Last Updated:** 2026-07-09 (evening) CEST
**Active Feature:** feat-018 done - schema family draft; feat-013 (.skogai/ manifest schema) still pending, next up

## Status

### What's Done

- [x] Added `docs/README.md` as the documentation entry point.
- [x] Added `docs/implementation.md` describing manifest resolution, sync flow, managed output, templates, and security boundaries.
- [x] Linked `docs/` from the top-level `README.md`.
- [x] Added `feature_list.json`, `progress.md`, `init.sh`, and `session-handoff.md`.
- [x] Updated `AGENTS.md` with startup workflow, scope control, definition of done, and end-of-session rules.
- [x] Added `src/commands/harness-init.js` (new `skogharness harness-init [dir]` command) and wired it into `bin/cli.js` and `src/index.js`.
- [x] Squash-merged everything above to `master` as `8a68ae8 feat: add harness startup scaffold`.
- [x] Ran full verification from master via `./init.sh`: `bun install`, `bun run lint`, `bun test` (46/46 pass), and harness-creator's own `validate-harness.mjs` at 100/100.
- [x] Added/refined `docs/harness-blueprint.md` using the `claude-code-harness` blueprint contract for this repo's agentic system.
- [x] Recorded `feat-006` as complete in `feature_list.json`.
- [x] Added `docs/superpowers/specs/2026-07-08-session-hooks-verification-design.md`.
- [x] Added `docs/superpowers/plans/2026-07-08-session-hooks-verification.md`.
- [x] Recorded `feat-007` as complete in `feature_list.json`.
- [x] Removed duplicate `harness-creator` and `toon-formatter` rows from `src/profiles.js` so Codex skill generation writes each target once.
- [x] Added a `registered skill ids are unique` test in `test/skill-quality.test.js`.
- [x] Recorded `feat-008` as complete in `feature_list.json`.
- [x] Confirmed `npx skogharness@latest sync` is not currently runnable because npm returns 404 for `skogharness`.
- [x] Replaced generated sync guidance with `npx --yes github:skogai/harness sync`, plus `harness sync` for global installs.
- [x] Added the `harness-meta` profile and switched this repo's `skogai.json` to that profile.
- [x] Added manifest coverage proving `harness-meta` resolves to the self-hosting full skill set.
- [x] Ran `harness sync`/`node bin/cli.js sync` so `AGENTS.md`, `CLAUDE.md`, `.claude/`, and `.codex/` reflect the manifest.
- [x] Recorded `feat-009` as complete in `feature_list.json`.
- [x] Merged and pushed the generated harness sync outputs and `harness-meta` work.
- [x] Added future feature proposals for documentation currency mapping, the turn lifecycle contract, and the template script validator surface.
- [x] Planned the `.skogai/` template architecture (state gets its own directory parallel to `.claude`/`.codex`; `templates/` mirrors the real output tree 1:1; templates are self-describing frontmatter objects, not a hardcoded copy map; fields resolve via an env → `skogai.json` → frontmatter → default cascade; Claude Code only this round).
- [x] Wrote `docs/dot-skogai-templates.md` as the index doc for that architecture.
- [x] Added `feat-013`..`feat-017` to `feature_list.json` (status `pending`), each cast as intent / needed input / expected output: manifest schema, functional contract, template engine, `templates/` mirror + `.skogai/` content + wiring (retiring `harness-init`), status drift detection + docs/test close-out.
- [x] Ran `./init.sh`: install clean, lint clean, 47/47 tests pass, harness validation 80/100 (pre-existing instruction-wording gaps, unrelated to this session's changes — see Blockers).
- [x] Drafted `templates/schemas/agent.schema.json` (plain domain object mirroring `AGENT_TARGETS` in `src/agents.js`).
- [x] Drafted `templates/schemas/skill.schema.json` as a document type (practice example of the `allOf` + `document.schema.json` pattern `router.schema.json` uses).
- [x] Drafted `templates/schemas/manifest.schema.json` as the skogai.json contract (version/targets/profile/skills/mcps/model) — narrower than feat-013's planned schema, which still needs `state`/`templates` fields added.
- [x] Moved `document.schema.json`/`defs.schema.json`/`router.schema.json` from `.skogai/schemas/` (a symlink into the separate `dot-skogai` repo, used only as a style reference) into `templates/schemas/` — `templates/` is this repo's authored source; `.skogai/` is a future deploy target, not touched further.
- [x] Fixed `scripts/_validate_file.py`: added PEP 723 inline deps (`jsonschema`, `pyyaml`) so `uv run` provisions them without a system-wide `pip install`; added the missing `"skill"` entry to `TYPE_TO_SCHEMA`; caught `yaml.YAMLError` in `parse_frontmatter` instead of letting it crash with a raw traceback.
- [x] Fixed `scripts/validate-schema.sh`: an unguarded `result=$(...)` under `set -e` meant the first `FAIL` silently aborted the whole script before the summary ever printed — added `|| true`.
- [x] Recorded `feat-018` as done in `feature_list.json` with verification evidence.

### What's In Progress

- [ ] None. `feat-013` (manifest schema) is the next planned feature but has not been started. `feat-010`..`feat-012` remain planned/proposed and unstarted, independent of the `.skogai/` work.

### What's Next

1. Start `feat-013`: formalize a JSON Schema for `skogai.json` (proposed location `templates/skogai.schema.json`) covering current fields plus the new `state` and `templates` fields needed by the `.skogai/` work.
2. Then `feat-014`: write the functional contract (every exposed function/CLI surface, with input/output types) before any engine code.
3. `feat-010` (documentation currency map) and `feat-011`/`feat-012` (turn lifecycle contract, validator surface) are still queued independently — pick up whichever the user prioritizes next.

## Blockers / Risks

- [ ] The npm-registry command `npx skogharness@latest sync` is not runnable until the package is published or made accessible on npm.
- [ ] Documentation now mixes implemented behavior with proposed hook/turn ideas; the next pass must mark current vs future clearly before implementation continues.
- [ ] `harness-creator` validation currently reports 80/100 (instructions 3/5, scope 3/5, lifecycle 4/5): "startup workflow documented," "definition of done documented," "one-feature-at-a-time rule," "completion gate limits scope closure," and "end-of-session procedure exists" all FAIL. This predates the `.skogai/` planning pass — not caused by it — but should be addressed, likely as part of an `AGENTS.md`/`SKOGAI.md` wording pass rather than a new feature.
- [ ] Open naming question carried into `feat-013`: does "harness.json schema" mean formalizing the existing `skogai.json` manifest (assumed in the plan), or a separate generated `harness.json` file (e.g. persisted `resolveManifest()` output)? Confirm at `feat-013` kickoff rather than assuming further.

### Resolved

- [x] Pre-existing code changes (`bin/cli.js`, `src/index.js`, `src/commands/harness-init.js`) were reviewed and verified: lint clean, 46/46 tests pass, now part of the merged `master` history.
- [x] Checkout confusion (`/home/skogix/dev/harness/harness-starting-features-documentation` vs `/home/skogix/dev/harness/starting-harness-setup`) is moot — the worktree was squash-merged and removed; work now lives on `master` in the main checkout.
- [x] Generated `.claude/` and `.codex/` outputs are intended to be committed for this self-hosting repo, and `.gitignore` was adjusted accordingly.
- [x] The `harness-meta` and generated sync changes were merged and pushed.

## Decisions Made

- **Use docs for rationale**: keep the top-level README focused on install and usage, and place implementation rationale under `docs/`.
  - Context: the user requested a `./docs/` folder describing why and how the implementation works.
- **Preserve existing AGENTS.md content**: add only a small harness workflow section rather than replacing repository guidelines.
  - Context: existing instructions already describe structure, commands, style, tests, PRs, and security.
- **Blueprint should describe governance, not claim runtime ownership**: `skogharness` installs and validates harness scaffolding, while the host agent still runs the model/tool loop.
  - Context: the `claude-code-harness` skill requires explicit separation between model, harness runtime, external tools, durable storage, and human operators.
- **Session reliability should reuse existing SkogAI pieces**: startup and stop lifecycle wiring belongs to `skoghooks`, JSON state handling should follow `skogai-jq`, and acceptance tests should follow `skogai-tests`.
  - Context: the user pointed out these projects already contain the needed basics, so the spec avoids a new hook framework.
- **Skill ids must remain unique in `SKILLS`**: category labels can group skills, but duplicate ids cause generated Codex installs to try writing the same `.codex/skills/<id>/SKILL.md` twice without `--force`.
  - Context: `bun run test` failed on generated Codex target output after `harness-creator` and `toon-formatter` were registered twice.
- **Use a named meta profile for self-hosting**: `harness-meta` carries the intent that this repo is installing the full SkogAI/harness operating layer, while `all` remains the generic "every shipped skill" preset.
  - Context: the root `skogai.json` should explain why this repo wants the full set instead of depending on the generic `all` label.
- **Do not advertise npm-backed npx until it exists**: use the verified GitHub-backed npx form in generated guidance for now.
  - Context: `npx skogharness@latest sync` and `npm view skogharness` both return npm 404 in this environment.
- **Treat each user exchange as a turn**: future lifecycle design should model every incoming message or hook-delivered initiative through final user response or hook decision, rather than treating only branch/session startup as the lifecycle boundary.
  - Context: `./init.sh` remains useful, but it is one verification command inside a broader turn lifecycle.
- **Classify docs before building more lifecycle code**: the next feature should separate current/in-use docs from proposed/future docs, especially around hooks, turn lifecycle, and generated skill validators.
  - Context: the repo now contains implemented sync/meta behavior plus forward-looking Superpowers plans and unadvertised Python validators.
- **State gets its own directory, `.skogai/`, parallel to `.claude/`/`.codex/`**: only `skogai.json` stays loose at project root; state files and deployed templates move under `.skogai/`.
  - Context: `harness-init`, `init`, and `sync` currently overlap ad hoc on state scaffolding (`.planning/codebase/CONCERNS.md` flags this as tech debt); giving state the same first-class treatment agent-owned dirs already get resolves the overlap architecturally rather than patching it.
- **`templates/` mirrors the real installed output tree 1:1**: `templates/codex/` → `templates/.codex/`, `templates/blocks/` → `templates/prompts/`, new `templates/.skogai/`.
  - Context: the codex rename fixes a latent bug (`AGENT_TARGETS.codex.outputDir` is already `.codex`); the blocks rename names what those files actually are (spliced markdown fragments, not copied wholesale).
- **A template is a self-describing frontmatter object, not a hardcoded copy-map entry**: `type`/`permalink`/`tag`/`symlink-source`/`symlink-target` frontmatter declares what a file is and where it deploys; only `type: template` is engine-actionable.
  - Context: modeled directly on skogix's own hand-written example at `~/.skogai/projects/harness/templates/QUESTIONS.list`.
- **Templated fields resolve via a cascade: env var → `skogai.json` → template frontmatter → hardcoded default**, one generic resolver, no per-field special-casing.
  - Context: mirrors `skogcli`'s own config resolution pattern; symlink-vs-copy is just another field resolved this way, not a separate architectural decision.
- **This round of `.skogai/` work is Claude Code only**; `syncCodex()`, this repo's own root state-file migration, and action verbs beyond `copy`/`symlink` are explicitly deferred.
  - Context: skogix's explicit scoping instruction, to keep feat-013..017 provable end-to-end before generalizing.
- **Every new feature description is cast as intent / needed input / expected output**, not free prose.
  - Context: skogix directly hand-edited the plan file to require this structure; applied to feat-013..017.

## Files Modified This Session

- `README.md` - linked to implementation docs.
- `docs/README.md` - added docs folder entry point.
- `docs/implementation.md` - added implementation rationale and maintenance notes.
- `AGENTS.md` - added startup workflow and definition of done.
- `feature_list.json` - added active feature tracker.
- `progress.md` - added restartable progress log.
- `init.sh` - added repo verification entrypoint.
- `session-handoff.md` - added session handoff template.
- `src/commands/harness-init.js` - new `skogharness harness-init` command.
- `bin/cli.js`, `src/index.js` - registered/exported the new command.
- `docs/harness-blueprint.md` - added/refined the harness-level blueprint for this agentic system.
- `feature_list.json`, `progress.md`, `session-handoff.md` - recorded blueprint status and verification evidence.
- `docs/superpowers/specs/2026-07-08-session-hooks-verification-design.md` - design spec for startup context injection and stop-time verification.
- `docs/superpowers/plans/2026-07-08-session-hooks-verification.md` - implementation plan for the spec.
- `feature_list.json`, `progress.md`, `session-handoff.md` - recorded spec/plan status and verification evidence.
- `src/profiles.js` - removed duplicate skill registrations and restored quote style.
- `test/skill-quality.test.js` - added a uniqueness regression test for registered skill ids.
- `feature_list.json`, `progress.md`, `session-handoff.md` - recorded the registry fix and verification evidence.
- `src/profiles.js` - added `harness-meta` and shared TOON command/profile constants.
- `skogai.json` - switched this repo to `profile: "harness-meta"`.
- `templates/blocks/claude-skills.md`, `src/commands/add.js`, `src/commands/init.js`, `src/commands/status.js`, `src/commands/sync.js`, `README.md`, `bin/cli.js`, `docs/features.md`, `docs/harness-blueprint.md` - replaced broken npm-backed npx guidance or documented the new profile.
- `test/manifest-sync.test.js` - added `harness-meta` profile coverage.
- `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/` - regenerated by sync from `skogai.json`.
- `feature_list.json` - added planned/proposed features for docs currency, turn lifecycle, and validator surfacing.
- `progress.md`, `session-handoff.md` - updated next-step guidance after the merge/push.
- `docs/dot-skogai-templates.md` - new index doc for the `.skogai/` template architecture.
- `feature_list.json` - added `feat-013`..`feat-017` (`.skogai/` manifest schema, functional contract, template engine, mirror+wiring, status/docs/test close-out), status `pending`.
- `progress.md`, `session-handoff.md` - recorded the `.skogai/` planning pass and updated next-step guidance.

## Evidence of Completion

- [x] Whitespace check: `git diff --check -- README.md docs/README.md docs/implementation.md`
- [x] Whitespace check: `git diff --check -- README.md AGENTS.md docs/README.md docs/implementation.md feature_list.json progress.md init.sh session-handoff.md`
- [x] Harness validation: `node templates/.claude/skills/harness-creator/scripts/validate-harness.mjs --target .` reported 100/100.
- [x] Full project verification: `./init.sh` run from `master` after merge - `bun install`, `bun run lint` clean, `bun test` 46/46 pass, harness validation 100/100.
- [x] Blueprint whitespace check: `git diff --check -- docs/harness-blueprint.md`.
- [x] Spec/plan checks: `node -e "JSON.parse(...feature_list.json...)"`, placeholder `rg`, `git diff --check -- feature_list.json progress.md session-handoff.md`, `git diff --check --no-index -- /dev/null <new-doc>`, and final whitespace/newline content scan.
- [x] Registry fix test suite: `bun run test` passed 47/47.
- [x] Registry fix lint: `bun run lint` passed.
- [x] Full registry fix verification: `./init.sh` passed, including install, lint, 47 tests, and harness validation 100/100.
- [x] Exact npm npx check: `npx --yes skogharness@latest sync .` failed with npm 404, proving the advertised command was not runnable.
- [x] GitHub npx help check: `npx --yes github:skogai/harness --help` passed.
- [x] Local package npx sync check: `npx --yes --package . harness sync <tmpdir>` passed with `profile: harness-meta`, followed by `node bin/cli.js status <tmpdir>` in sync.
- [x] Current repo status check: `node bin/cli.js status .` reports Claude Code and Codex in sync for `profile: harness-meta`.
- [x] Full test suite: `npm test` passed 47/47.
- [x] Whitespace check: `git diff --check` passed.
- [x] Planning update validation: `feature_list.json` parsed successfully and `git diff --check` passed.
- [x] `.skogai/` planning pass: `node -e "JSON.parse(require('fs').readFileSync('feature_list.json'))"` passed; `git diff --check -- feature_list.json docs/dot-skogai-templates.md` passed; `./init.sh` from repo root — `bun install` no changes, lint clean, `bun test` 47/47 pass, harness validation 80/100 (instructions/scope/lifecycle FAILs pre-exist this pass, see Blockers).

## Notes for Next Session

Start by reading `AGENTS.md`, `feature_list.json`, `progress.md`, and `session-handoff.md`. Two independent queues are now pending: (1) `feat-010`..`feat-012` (docs currency map, turn lifecycle contract, validator surface) and (2) `feat-013`..`feat-017` (the newly planned `.skogai/` template architecture — manifest schema, functional contract, engine, mirror+wiring, status/docs close-out). Neither has been started; `feat-013` is the recommended next step given it's the smallest, most concrete unit (formalize a JSON Schema for `skogai.json`). See `docs/dot-skogai-templates.md` for the full `.skogai/` design.
