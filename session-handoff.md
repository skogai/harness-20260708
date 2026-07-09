# Session Handoff

## Current Objective

- Goal: Plan the next harness lifecycle features after the self-hosting sync work was merged and pushed.
- Current status: `feat-010` is planned as the next feature: review documentation and state files, then classify what is current/in-use, proposed/future, or stale/superseded. `feat-011` and `feat-012` are proposed follow-ons for the turn lifecycle contract and validator command surface.
- Branch / commit: current branch `master`; worktree was clean before this planning update.

## Completed This Session

- [x] Added `docs/README.md`.
- [x] Added `docs/implementation.md`.
- [x] Linked `docs/` from `README.md`.
- [x] Ran `harness-creator` validation once and identified missing state/lifecycle artifacts.
- [x] Added `feature_list.json`, `progress.md`, `init.sh`, and `session-handoff.md`.
- [x] Updated `AGENTS.md` with startup, scope, done, and end-of-session rules.
- [x] Added `src/commands/harness-init.js`, a new `skogharness harness-init [dir]` command that scaffolds these same state/lifecycle files for other target repos; wired into `bin/cli.js` and `src/index.js`.
- [x] Squash-merged the branch to `master`; worktree cleaned up.
- [x] Ran full verification (`./init.sh`) from `master`: install, lint, tests, harness audit.
- [x] Added/refined `docs/harness-blueprint.md` with the requested harness blueprint sections.
- [x] Added `feat-006` to `feature_list.json` and marked it done with focused verification evidence.
- [x] Updated `progress.md` and this handoff for the docs-only blueprint pass.
- [x] Added `docs/superpowers/specs/2026-07-08-session-hooks-verification-design.md`.
- [x] Added `docs/superpowers/plans/2026-07-08-session-hooks-verification.md`.
- [x] Added `feat-007` to `feature_list.json` and marked it done with focused verification evidence.
- [x] Updated `progress.md` and this handoff for the spec/plan pass.
- [x] Removed duplicate `harness-creator` and `toon-formatter` rows from `src/profiles.js`.
- [x] Added `registered skill ids are unique` coverage in `test/skill-quality.test.js`.
- [x] Added `feat-008` to `feature_list.json` and marked it done with lint/test evidence.
- [x] Updated `progress.md` and this handoff for the registry fix.
- [x] Verified `npx skogharness@latest sync` fails with npm 404 because `skogharness` is not currently available from the public npm registry.
- [x] Verified `npx --yes github:skogai/harness --help` is runnable.
- [x] Added `harness-meta` in `src/profiles.js` and switched root `skogai.json` to it.
- [x] Updated generated/user-facing guidance to use `npx --yes github:skogai/harness sync`, with `harness sync` as the global-install option.
- [x] Added `harness-meta` profile coverage in `test/manifest-sync.test.js`.
- [x] Regenerated sync outputs for Claude and Codex.
- [x] Added `feat-009` to `feature_list.json` and updated progress/handoff evidence.
- [x] Merged and pushed the generated harness sync outputs and `harness-meta` work.
- [x] Added `feat-010` documentation currency map as the next planned feature.
- [x] Added `feat-011` turn lifecycle contract as a proposed follow-on.
- [x] Added `feat-012` template script validator surface as a proposed follow-on.
- [x] Updated progress/handoff so the next step is to classify docs as current/in-use, proposed/future, or stale/superseded.

## Verification Evidence

| Check | Command | Result | Notes |
|---|---|---|---|
| Whitespace | `git diff --check -- README.md docs/README.md docs/implementation.md` | Pass | Ran before lifecycle files were added. |
| Harness audit | `node templates/.claude/skills/harness-creator/scripts/validate-harness.mjs --target .` | Fail, 28/100 | Expected before adding lifecycle files. |
| Harness audit | `node templates/.claude/skills/harness-creator/scripts/validate-harness.mjs --target .` | Pass, 76/100 | Remaining misses were instruction wording before final AGENTS.md tightening. |
| Whitespace | `git diff --check -- README.md AGENTS.md docs/README.md docs/implementation.md feature_list.json progress.md init.sh session-handoff.md` | Pass | Final focused whitespace check. |
| Harness audit | `node templates/.claude/skills/harness-creator/scripts/validate-harness.mjs --target .` | Pass, 100/100 | Final harness structure check, pre-merge. |
| Lint | `bun run lint` | Pass | Run from `master` post-merge, includes `src/commands/harness-init.js`. |
| Tests | `bun test` | Pass, 46/46 | Run from `master` post-merge. |
| Full init | `./init.sh` | Pass | install + lint + test + harness audit (100/100), run from `master`. |
| Blueprint whitespace | `git diff --check -- docs/harness-blueprint.md` | Pass | Focused docs-only check for the blueprint file. |
| Spec/plan checks | JSON parse, placeholder `rg`, `git diff --check` for tracked state files, `git diff --check --no-index` for new docs, and whitespace/newline scan | Pass | Focused docs/state checks for the spec and plan files. |
| Registry tests | `bun run test` | Pass, 47/47 | Includes new duplicate skill-id guard. |
| Registry lint | `bun run lint` | Pass | ESLint clean after registry/test changes. |
| Full registry verification | `./init.sh` | Pass | install + lint + 47 tests + harness validation 100/100. |
| Exact npm npx check | `npx --yes skogharness@latest sync .` | Fail | npm 404; proves the previous generated guidance was not runnable from the public registry. |
| GitHub npx check | `npx --yes github:skogai/harness --help` | Pass | Verifies a no-install command form exists. |
| Local npx sync | `npx --yes --package . harness sync <tmpdir>` | Pass | Verifies the current package supports `profile: harness-meta`. |
| Current status | `node bin/cli.js status .` | Pass | Claude Code and Codex in sync for `profile: harness-meta`. |
| Tests | `npm test` | Pass, 47/47 | Full test suite. |
| Whitespace | `git diff --check` | Pass | No whitespace errors. |
| Planning state | `node -e "JSON.parse(require('fs').readFileSync('feature_list.json','utf8'))"` | Pass | Confirms proposed feature additions keep JSON valid. |
| Whitespace | `git diff --check` | Pass | Focused planning/state update has no whitespace errors. |

## Files Changed

- `README.md`
- `docs/README.md`
- `docs/implementation.md`
- `AGENTS.md`
- `feature_list.json`
- `progress.md`
- `init.sh`
- `session-handoff.md`
- `src/commands/harness-init.js`
- `bin/cli.js`
- `src/index.js`
- `docs/harness-blueprint.md`
- `feature_list.json`
- `progress.md`
- `session-handoff.md`
- `docs/superpowers/specs/2026-07-08-session-hooks-verification-design.md`
- `docs/superpowers/plans/2026-07-08-session-hooks-verification.md`
- `src/profiles.js`
- `test/skill-quality.test.js`
- `skogai.json`
- `templates/blocks/claude-skills.md`
- `src/commands/add.js`
- `src/commands/init.js`
- `src/commands/status.js`
- `src/commands/sync.js`
- `README.md`
- `test/manifest-sync.test.js`
- generated `AGENTS.md`, `CLAUDE.md`, `.claude/`, and `.codex/` outputs from sync
- `feature_list.json` - added `feat-010`, `feat-011`, and `feat-012`.
- `progress.md` - updated next-step guidance for the documentation currency pass.
- `session-handoff.md` - updated startup context for the next session.

## Decisions Made

- Keep implementation rationale in `docs/` rather than expanding the top-level README.
- Add minimal harness lifecycle artifacts directly because the existing `AGENTS.md` should be preserved.
- Scaffold state/lifecycle files as a first-class `skogharness harness-init` command in `src/`, not a one-off external script, since this repo's product is itself a harness installer.
- Frame the blueprint as governance around host agents, not as a claim that `skogharness` owns the model turn loop.
- Use `skoghooks`, `skogai-jq`, and `skogai-tests` as the design substrate for lifecycle reliability instead of designing a new hook framework.
- Keep `SKILLS` ids unique; generated Codex installs write `.codex/skills/<id>/SKILL.md` once per registered id unless explicitly forced.
- Use `harness-meta` for repos that are self-hosting the SkogAI/harness operating layer; keep `all` as the generic "every shipped skill" preset.
- Do not advertise `npx skogharness@latest` until the package exists on npm; the currently verified no-install form is `npx --yes github:skogai/harness`.
- Define a harness "turn" before adding more hook implementations. A turn starts from a user message, hook event, resume, or other initiative source and ends when the agent returns the final response or hook decision.
- Treat `./init.sh` as one verification command inside the turn lifecycle, not as the complete lifecycle boundary.
- Do a documentation currency pass before implementing the turn lifecycle, because current docs mix implemented behavior with future hook/turn proposals.

## Blockers / Risks

- `npx skogharness@latest sync` is still not runnable because npm returns 404 for `skogharness`.
- Documentation surfaces are not yet labeled by maturity. The next pass must identify current/in-use docs, proposed/future docs, and stale/superseded docs before implementation continues.
- `templates/.claude/scripts/*.py` contains useful validators that are not clearly documented or wired into package scripts.

## Next Session Startup

1. Read `AGENTS.md`.
2. Read `feature_list.json` and `progress.md`.
3. Review this handoff.
4. Run focused checks for docs/state-only work, or `./init.sh` before code changes.
5. Start `feat-010` unless the user redirects.

## Recommended Next Step

- Execute `feat-010`: review README, AGENTS.md, CLAUDE.md, docs/, generated `.claude`/`.codex` guidance, and lifecycle state files. Produce a map of current/in-use, proposed/future, and stale/superseded documentation.
- Include the unadvertised `templates/.claude/scripts/*.py` validators in that pass and decide whether they belong in package scripts, `init.sh`, or separate validation docs.
- After the docs map is current, write `feat-011` as the turn lifecycle contract and use the existing session hooks spec as supporting input.
