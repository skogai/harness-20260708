# VALIDATOR SCRIPT GUIDANCE

## OVERVIEW

`scripts/` is the repository's flat validation and maintenance domain. Most Python validators have colocated `test_*.py` unit tests; shell files orchestrate validation, install, or parsing tasks.

## WHERE TO LOOK

| Task | Files |
|---|---|
| Skill content rules | `validate_skill_quality.py`, `check_skill_language.py`, `check_skill_closure.py` |
| Public-doc rules | `check_reference_neutrality.py`, `validate_router.py` |
| Profile/template rules | `check_profile_consistency.py`, `validate_plugin_metadata.py` |
| Schema entrypoint | `validate-schema.sh`, `_validate_file.py`, `_lib.py` |
| Global package install | `install-global.sh` and `../test/install-global-script.test.js` |

## CONVENTIONS

- Prefix private helpers with `_`; keep runnable validators at the directory root.
- Pair new Python validators with a focused `test_<validator>.py` test in this directory; `validate_router.py` is the existing exception.
- Python tests use `unittest`, temporary directories, and dynamic sibling-module loading rather than package imports.
- Shell scripts use strict mode where compatible and emit actionable PASS/FAIL/WARN output.
- Document validation intentionally targets Markdown with frontmatter or XML roots; schemas themselves are not validated by `validate-schema.sh`.

## ANTI-PATTERNS

- Do not move tests into a new fixture tree without a concrete shared-fixture need; current fixtures are purpose-built and inline.
- Do not silently broaden public-surface allowlists; neutrality and language checks encode distribution policy.
- Do not assume `bun run test` exercises Python validators; package scripts currently wire only Node tests.
- Do not turn warnings into failures without checking the caller contract; `validate-schema.sh` distinguishes warnings from errors.

## VALIDATION

```bash
python scripts/test_validate_skill_quality.py
python scripts/test_check_skill_language.py
./scripts/validate-schema.sh
bun run test
```
