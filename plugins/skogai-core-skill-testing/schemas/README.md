# schemas

JSON Schema (draft 2020-12) definitions for skogai routing framework documents.

| file                      | purpose                                                                | key required structure                                                                      |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `defs.schema.json`        | shared `$defs` (slug, path, tag, xmlSection, link, heading, listEntry) | —                                                                                           |
| `frontmatter.schema.json` | YAML frontmatter block; requires `type`                                | `type`                                                                                      |
| `document.schema.json`    | normalized document envelope                                           | `path`, `type`, `sections`                                                                  |
| `skill.schema.json`       | Claude Code SKILL.md entrypoint                                        | `name`, `description` in frontmatter; `<objective>`, `<routing>` sections                  |
| `router.schema.json`      | routing file variant                                                   | `<objective>`, `<routing>` sections                                                         |
| `workflow.schema.json`    | workflow endpoint                                                      | `<objective>`, `<steps>`, `<validation>` sections                                           |
| `reference.schema.json`   | reference endpoint                                                     | `<overview>` section                                                                        |
| `template.schema.json`    | template endpoint                                                      | `<template>` section                                                                        |
| `script.schema.json`      | script endpoint                                                        | `type: script`                                                                              |
| `lesson.schema.json`      | lesson document                                                        | `match`, `lessonStatus`, `version` in frontmatter; `rule`, `context`, `pattern` headings    |
| `decision.schema.json`    | architectural decision record                                          | `<context>`, `<decision>`, `<rationale>` sections                                           |
| `pattern.schema.json`     | repeated practice pattern                                              | `<context>`, `<pattern>`, `<examples>` sections                                             |
| `principle.schema.json`   | standing premise                                                       | `statement` in frontmatter; `<rationale>`, `<implies>`, `<override>`, `<examples>` sections |
| `list.schema.json`        | immutable `.list` sequence                                             | array of checklist entries                                                                  |

## type → schema mapping

| frontmatter `type` | schema file             |
| ------------------ | ----------------------- |
| `skill`            | `skill.schema.json`     |
| `router`           | `router.schema.json`    |
| `workflow`         | `workflow.schema.json`  |
| `reference`        | `reference.schema.json` |
| `template`         | `template.schema.json`  |
| `script`           | `script.schema.json`    |
| `lesson`           | `lesson.schema.json`    |
| `decision`         | `decision.schema.json`  |
| `pattern`          | `pattern.schema.json`   |
| `principle`        | `principle.schema.json` |
| `list`             | `list.schema.json`      |

## file convention → schema mapping

| file convention                                          | schema file            |
| -------------------------------------------------------- | ---------------------- |
| `*.md` with recognized `type` frontmatter                | `<type>.schema.json`   |
| XML-root markdown without frontmatter, e.g. `<workflow>` | inferred from root tag |
| `*.list` with `type: list` frontmatter                   | `list.schema.json`     |

Example: `skogix.list` with `type: list` validates against
`list.schema.json`.

## validate

```sh
./scripts/validate-schema.sh [path-to-framework-root]
```
