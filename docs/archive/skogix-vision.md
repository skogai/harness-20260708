# 0 and does not crash (covers the "never block" requirement).

- Third case: appending twice results in two lines (append-only, not overwrite).
- Update `test/template-settings.test.js` only if the new hook wiring in `settings.local.json.example` needs a shape assertion — check whether that file is already asserted anywhere; if not, no change needed there (it's explicitly the opt-in/local file, not the fail-closed one).

## Files touched

- `templates/.claude/hooks/event-logger.sh` (new)
- `templates/.claude/settings.local.json.example` (add hook wiring)
- `templates/.claude/hooks/README.md` (document new hook)
- `.gitignore` (add ignore pattern for the generated log)
- `test/hook-event-logger.test.js` (new)

## Verification

- `bun test` — new test file passes, all 46+ existing tests still pass.
- `bun run lint` — clean (script is bash, not linted by ESLint; no JS changes needed unless a test helper requires one).
- Manual: `echo '{"hook_event_name":"PreToolUse","tool_name":"Bash","session_id":"test"}' | CLAUDE_PROJECT_DIR=/tmp/probe templates/.claude/hooks/event-logger.sh` then inspect `/tmp/probe/.harness/events.jsonl`.
- Re-run `./init.sh` to confirm harness validation stays green (this is additive, shouldn't regress the 100/100 score). Universal JSONL event logger hook

## Context

skogix wants the harness (this repo, `skogharness`) to give any project it scaffolds an easy, built-in way to capture everything that happens in a Claude Code session — every tool call, message, and lifecycle event — as append-only JSON lines. This is step one of a two-part idea; the second part (declarative hook registration via `skogai.json`) is explicitly deferred to a later session per skogix's answer.

Reference implementation `~/.local/src/skoghooks` proved the pattern (13 separate per-event scripts, JSON logs, `uv run` shebang). skogix chose: **bash** (matches this repo's existing `templates/.claude/hooks/*.sh` convention), log to **`.harness/events.jsonl`**, and **logger only** this session (no manifest/sync wiring yet).

Exploration confirmed:

- `templates/.claude/hooks/` is copied whole-directory to target projects (`src/utils/copy.js` `copyHooks`) — dropping a new script there is enough, no allowlist to update.
- No test currently executes a hook script directly; I'll add one that does (spawn the script, feed stdin JSON, assert the jsonl output).
- `templates/.claude/settings.json` is deliberately hook-free (enforced by `test/template-settings.test.js` — "fail-closed"); wiring must go in `templates/.claude/settings.local.json.example` instead, same place the other hooks (`secret-scanner.sh` etc.) are documented as opt-in.
- `.harness/` does not exist by default in a scaffolded project, so the script must `mkdir -p` its log directory before appending, and it can't assume the directory is pre-created or already gitignored.

## Approach

1. **New script**: `templates/.claude/hooks/event-logger.sh`
   - Universal handler: same script wired to every hook event type (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Notification`, `Stop`, `SubagentStart`, `SubagentStop`, `SessionStart`, `SessionEnd`, `PreCompact`, `PermissionRequest`, `Setup`).
   - Reads the hook's JSON payload from **stdin** (the actual Claude Code hook contract — matches skoghooks, not the env-var style `secret-scanner.sh` uses; I'm not touching the existing hooks' contract, just using the correct one for this new script).
   - Adds a `logged_at` ISO timestamp field, appends the single JSON object as one line to `$CLAUDE_PROJECT_DIR/.harness/events.jsonl` (creating `.harness/` with `mkdir -p` if missing).
   - Never blocks: wrapped so any internal failure (bad JSON, write error) is swallowed and it still exits 0. Matches the "never crash a hook" rule from skoghooks' `CLAUDE.md`.

2. **Wire it in** `templates/.claude/settings.local.json.example`: add an entry per hook event pointing at `$CLAUDE_PROJECT_DIR/.claude/hooks/event-logger.sh`, alongside the existing opt-in hooks, so a user who copies this file to `settings.local.json` gets logging for free.

3. **Document it** in `templates/.claude/hooks/README.md`: add a numbered section (matches the existing format) describing the event logger, its output path, and that it's non-blocking/append-only.

4. **Gitignore**: add `.harness/events.jsonl` (or `.harness/` generally, scoped to avoid clobbering any real harness-creator `.harness/` state a project might separately adopt) so the generated log file doesn't get committed. Root `.gitignore` currently has no `.harness/`/`*.jsonl` pattern — add one, and mirror it in `templates/` if target-project gitignore templating exists (check `copy.js`/`templates/` for an existing `.gitignore` template to extend; if none exists, just document the ignore line in the README rather than inventing a new templating mechanism).

5. **Tests** (TDD): new `test/hook-event-logger.test.js`
   - Spawn `templates/.claude/hooks/event-logger.sh` as a child process with `CLAUDE_PROJECT_DIR` set to a temp dir, feed a sample hook JSON payload (e.g. a `PreToolUse` shape) on stdin.
   - Assert: exit code 0, `.harness/events.jsonl` created, contains exactly one line, line parses as JSON, contains the original payload fields plus `logged_at`.
   - Second case: malformed stdin (non-JSON) still exits
