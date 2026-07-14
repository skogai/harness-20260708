# AGENTS.md - dot-core skills

## OVERVIEW
Workflow skill packages for the dot-core plugin. This directory is sparse at the top level but contains one very large authored subtree: `skogai-jq`.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| jq transformation work | `skogai-jq/` | 70 transform dirs and local AGENTS |
| Worktree/worktrunk guidance | `skogai-worktrunk/` | Markdown-heavy skill package |
| Skill entrypoint | `<skill>/SKILL.md` | Router and trigger description |
| Skill references | `<skill>/references/` | Load-on-demand detail |
| Skill scripts | `<skill>/scripts/` | Only reusable helpers |

## CONVENTIONS
- `SKILL.md` is the routing surface; keep it short unless the existing skill is intentionally long-form.
- Prefer `references/`, `workflows/`, `templates/`, and `scripts/` for detail.
- Descriptions in frontmatter are third-person trigger descriptions.
- References should stay one level deep from the skill root.
- Use local child AGENTS only for large authored subtrees with distinct conventions.

## ANTI-PATTERNS
- Do not add AGENTS files inside individual jq transform directories.
- Do not mix runtime implementation into `tasks/` or planning docs.
- Do not copy cached/system skill conventions from `config/codex/skills/.system/` into authored skills.
- Do not turn every small skill into a multi-file hierarchy without need.

## NOTES
- `skogai-jq` is the exception that needs child guidance because it dominates file count and has strict transform/test/schema rules.
- Parent plugin guidance still applies for secrets, manifests, shell style, and tests.
