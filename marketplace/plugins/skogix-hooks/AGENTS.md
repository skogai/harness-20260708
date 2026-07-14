# AGENTS.md - dot-core plugin

## OVERVIEW

Authored SkogAI core plugin for reusable hooks, skills, agents, slash-command shims, shell utilities, MCP/app definitions, and Bats coverage.

## STRUCTURE

```
dot-core/
├── .codex-plugin/plugin.json  # Plugin manifest and loading surface
├── hooks.json                 # Event wiring to shell routers
├── hooks/                     # Hook entrypoints plus lesson_matcher.py
├── skills/                    # Workflow skills and jq transform library
├── agents/                    # Agent prompt definitions
├── commands/                  # Legacy slash-command compatibility shims
├── scripts/                   # Shared shell helpers
└── tests/                     # Bats suites for hooks/scripts
```

## WHERE TO LOOK

| Task                | Location                    | Notes                            |
| ------------------- | --------------------------- | -------------------------------- |
| Plugin manifest     | `.codex-plugin/plugin.json` | Skills/hooks/MCP/apps pointers   |
| Hook wiring         | `hooks.json`                | Codex schema-backed hook events  |
| Hook implementation | `hooks/`                    | Shell routers and Python matcher |
| Shared hook helpers | `scripts/skogai-jq.sh`      | JSON field/log/output helpers    |
| Skill work          | `skills/`                   | See local skills AGENTS          |
| jq transforms       | `skills/skogai-jq/`         | Dense self-contained subtree     |
| Tests               | `tests/`                    | Bats with shared helper          |

## CONVENTIONS

- There is no plugin-level build step or package manager manifest.
- Shell scripts should stay small, quoted, and dependency-light; prefer shared helpers over duplicated JSON parsing.
- Python should use standard libraries where practical and keep hook behavior fail-open when injecting optional context.
- Skills keep `SKILL.md` focused; detailed workflows belong in references, scripts, templates, or child docs.
- `hooks.json` should map only Codex schema-backed events: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, and `Stop`.
- Bats tests live under `tests/<surface>/<name>.bats` and load `tests/test-helper.bash`.

## ANTI-PATTERNS

- Do not vendor missing local test tools into this plugin.
- Do not commit secrets, local tokens, or generated private context.
- Do not add package-manager scaffolding just to run shell/Python/jq tests.
- Do not hide hook behavior in manifests; manifests wire, scripts implement.
- Do not bloat `SKILL.md` when a targeted reference file would do.

## COMMANDS

```bash
# Full Bats suite from plugins/dot-core
bats tests/*

# Focused hook test
bats tests/stop/router.bats

# Manual hook fixture run
bash hooks/session-start.sh < input.json

# Python matcher debug/test
python hooks/lesson_matcher.py --mode session-start
uvx pytest hooks/test_lesson_matcher.py -v
```

## NOTES

- `.codex-plugin/plugin.json`, `hooks.json`, `.mcp.json`, and `.app.json` affect plugin loading.
- `config/codex/` can enable this plugin, but authored code lives here.
- The matcher loads lessons from `$HOME/.skogai/knowledge/lessons` by default.
