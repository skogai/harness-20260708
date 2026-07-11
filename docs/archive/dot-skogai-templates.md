# `.skogai/` template architecture

Index doc for feat-013..feat-017 in `feature_list.json`. This is a pointer
doc, not the schema or the contract themselves — those live where the code
lives (see links below) once feat-013/feat-014 land. Right now (planning
pass only) it records the *decisions*, not the artifacts.

## Why `.skogai/` exists

Today three commands overlap on state scaffolding: `init`, `harness-init`,
and `sync`. `harness-init` (`src/commands/harness-init.js:14-16`) reaches
into the `harness-creator` skill's private `templates/` folder to copy
`feature_list.json` / `progress.md` / `session-handoff.md` / `init.sh` loose
into a project root; `sync` never touches or re-seeds them. This is tracked
tech debt (`.planning/codebase/CONCERNS.md`, "Harness initialization logic
exists in multiple places").

`.skogai/` gives *our own state* the same first-class treatment `.claude/`
and `.codex/` already get for their respective agents: a directory the
harness owns and manages, instead of loose files scattered at project root
via a hardcoded copy map. Only `skogai.json` stays loose at project root —
everything else the harness generates for its own bookkeeping (state files,
templates deployed by the new engine) moves under `.skogai/`.

**Not migrated in this pass:** this repo's own root `feature_list.json` /
`progress.md` / `session-handoff.md` / `init.sh`. They actively govern this
very session via `SKOGAI.md`'s Agent Startup Workflow — moving them is a
deliberate later follow-up, not bundled into feat-013..017.

## The `templates/` mirror rule

`templates/` in this repo should mirror the real installed output tree 1:1,
so the source → destination mapping is legible from the path alone:

| Current | Renamed to | Why |
|---|---|---|
| `templates/codex/` | `templates/.codex/` | Fixes a latent bug: `AGENT_TARGETS.codex.outputDir` (`src/agents.js`) is already `.codex`; the template dir just never matched it. `getAgentTemplateDir()`'s `agent === 'claude'` special case in `src/utils/copy.js` goes away once both dirs follow the same rule. |
| `templates/blocks/` | `templates/prompts/` | Names what these files actually are — markdown fragments spliced into `CLAUDE.md` / `AGENTS.md` via `renderBlockTemplate()`, not files copied wholesale. |
| *(new)* | `templates/.skogai/` | Source templates for everything the engine deploys into a target project's `.skogai/`. |

`templates/.claude/skills/harness-creator/templates/*` is **not** touched by
this rename — it's the harness-creator skill's own standalone template copy
used by `create-harness.mjs`, which is self-relative and portable
(`path.join(SKILL_ROOT, 'templates')`) and has no dependency on the rest of
this package. Pre-existing, intentional duplication.

## The template object model

A template is a self-describing object, not an entry in a hardcoded map.
Modeled on `~/.skogai/projects/harness/templates/QUESTIONS.list`:

```
---
type: template
permalink: dot-skogai/QUESTIONS
symlink-target: .skogai/QUESTIONS.list
symlink-source: templates/QUESTIONS.list
tag: $questions
---

{{QUESTIONS}}
```

Frontmatter declares what the file *is* and where it deploys
(`type`, `permalink`, `tag`, `symlink-source`, `symlink-target`, and any
further fields a given template needs). The engine dispatches on whatever's
declared in `type`/action fields rather than enumerating a fixed action set
up front — `type: template` is actionable (deployed by the engine); other
types (`router`, `reference`, `user`) are documentation-only and never
deployed.

## The resolution cascade

Any templated field resolves in this order:

1. Environment variable
2. `skogai.json` (the `templates` override map, keyed by `permalink`)
3. The template's own frontmatter
4. Hardcoded default

One generic resolver function handles this for every field — no per-field
special-casing. Same shape as `skogcli`'s own config resolution (illustrative
reference only, not a dependency: `skogcli config get $.harness` returns
`"project": "[@env:SKOGAI_PROJECT]"`-style placeholders following the same
env-first pattern).

Symlink vs. copy is not a special case to pre-solve — it's just another
action resolved through the same cascade, configured per-template or
overridden per-project like any other field.

## Scope: Claude Code first

This round of work (feat-013..017) proves the engine end-to-end against the
`claude` sync target only. `syncCodex()` in `src/commands/sync.js` is
untouched. Not doing yet, explicitly out of scope for feat-013..017:

- Codex wiring for the new `.skogai/` engine
- Router-style rewrite of generated `CLAUDE.md` / `AGENTS.md`
- Action verbs beyond `copy` / `symlink`
- Migrating this repo's own root state files into `.skogai/`

## Where the artifacts will live

- **Schema** (feat-013): `templates/skogai.schema.json` (proposed location)
- **Functional contract** (feat-014): a contract section in this doc or a
  dedicated `docs/api-contract.md` — decided at feat-014's kickoff
- **Engine** (feat-015): `src/utils/template.js`
- **Wiring + content** (feat-016): `templates/.skogai/*`, `runSync()` in
  `src/commands/sync.js`, `resolveManifest()` in `src/manifest.js`
- **Status/docs/tests close-out** (feat-017): `src/commands/status.js`,
  `docs/features.md`, `docs/harness-blueprint.md`, `docs/specs.md`

See `feature_list.json` (feat-013..feat-017) for the full intent / needed
input / expected output breakdown per feature.
