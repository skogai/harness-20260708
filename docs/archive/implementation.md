# Implementation approach

`skogharness` is a Node.js ESM CLI that keeps agent setup declarative. The core
idea is that a project should describe its agent-facing configuration once in
`skogai.json`, then let the CLI write the native files each supported agent
expects.

## Why this shape

Agent tools tend to store configuration in different directories, file formats,
and local conventions. Without a common source of truth, project setup drifts:
skills are copied by hand, MCP server definitions diverge, and onboarding docs
become a second configuration system.

Harness avoids that by making `skogai.json` the durable project contract. Native
agent files are treated as generated projections of that contract wherever
possible, while hand-maintained skill content stays in templates and is copied
intentionally.

This gives the repo a few useful properties:

- one reviewable manifest for project agent configuration;
- repeatable initialization through `harness init`;
- deterministic updates through `harness sync`;
- drift detection through `harness status`;
- a clear distinction between managed output and human-authored project files.

## Runtime layout

The package is intentionally small:

- `bin/cli.js` is the executable entry point exposed as `skogharness` and
  `harness`.
- `src/commands/` contains CLI command handlers such as `init`, `sync`,
  `status`, and `add`.
- `src/manifest.js` owns loading, validating, and writing `skogai.json`.
- `src/agents.js`, `src/mcps.js`, and `src/profiles.js` define supported agent
  targets, MCP catalog entries, and starter profiles.
- `src/utils/` contains shared helpers for file copying, managed blocks,
  security checks, and TOON utilities.
- `templates/` contains files copied into initialized projects, including
  Claude and Codex scaffolding plus maintained skills.

Tests live in `test/` and use the built-in `node:test` runner.

## Data flow

The normal lifecycle is:

1. `harness init [dir]` creates or updates a project-level `skogai.json`,
   installs selected template files, then runs sync.
2. `harness add ...` mutates the manifest for specific additions such as MCP
   servers or skills.
3. `harness sync [dir]` resolves the manifest into a concrete plan and writes
   the corresponding native agent configuration.
4. `harness status [dir]` compares the manifest with native config and exits
   non-zero when the generated projection has drifted.

The manifest is the source of truth. Native config files should be reproducible
from it, except for deliberately local files such as ignored secrets or
developer-specific overrides.

## Manifest resolution

`src/manifest.js` validates `skogai.json` before it is used. The current
manifest supports:

- `version`: the manifest format version;
- `targets`: agent targets such as `claude`, `codex`, or `all`;
- `profile`: a named profile from `src/profiles.js`;
- `skills`: explicit skill ids;
- `mcps`: MCP server entries;
- `model`: target-specific model ids.

`resolveManifest()` merges profile defaults with explicit manifest entries.
Skills are de-duplicated while preserving order. MCP entries are keyed by name,
so an explicit manifest MCP can override a profile-provided MCP with the same
name.

## Managed output

When harness writes into a file that may also contain human-authored content, it
isolates generated content inside managed blocks. Managed blocks let the CLI
replace only the section it owns while preserving the rest of the file.

That rule keeps sync safe:

- generated content can be updated repeatedly;
- user-authored notes outside the block are preserved;
- reviews can clearly see what harness owns;
- status checks can detect drift without treating the whole file as disposable.

Current sync behavior uses managed Markdown blocks for `CLAUDE.md` and
`AGENTS.md`, and a managed hash-comment block for Codex TOML MCP config.
Claude MCP JSON is merged by MCP server key so harness-managed MCP entries can
be updated without deleting unrelated entries.

When adding a new generated target, prefer a managed block if the target format
allows it. If the native format does not support comments or block markers, keep
the generated file separate from local override files or merge by stable keys.

## Agent targets

Agent targets are intentionally narrow and explicit. `src/agents.js` currently
defines:

- `claude`: Claude Code output under `.claude`;
- `codex`: Codex output under `.codex` plus root `AGENTS.md`;
- `all`: an alias that expands to every supported target.

Each target should stay idiomatic for the tool that reads it. Shared behavior
belongs in manifest resolution and utility modules; target-specific file formats
belong in the target sync path.

## Templates and skills

Templates are copied content, not runtime code. The current package uses them to
ship starter agent files and maintained skills such as `toon-formatter` and
`harness-creator`.

Template changes should be made with the generated project experience in mind:

- do not assume template files run from this repository's source tree;
- keep paths relative to the initialized project where possible;
- avoid embedding local machine paths or real secrets;
- update tests when template output or expected scaffold files change.

`templates/.claude/` is Claude-facing scaffold content. `templates/codex/`
contains Codex-facing documentation and guidance. The package can support both
agents from the same manifest, but generated output should not force one
agent's conventions onto another.

## Security boundaries

Harness may write MCP server definitions and environment placeholders, so it
must avoid turning local secrets into committed project files. Prefer placeholder
values such as `${GITHUB_PERSONAL_ACCESS_TOKEN}` in generated examples and keep
developer-specific values in local ignored files.

`harness sync` collects environment variable references from MCP definitions,
adds missing names to `.env.example`, and reports unset variables. That makes
required configuration visible without copying secret values.

Security-sensitive behavior should be covered by focused tests under `test/`.
When changing MCP handling, environment variable handling, install scripts, or
template output, run the security test subset as well as the general suite.

## Change checklist

For implementation changes, use this checklist:

1. Update `skogai.json` parsing or sync behavior in the runtime source, not only
   in templates.
2. Preserve explicit `.js` imports and the existing ESM style.
3. Add or update tests for manifest parsing, sync output, CLI behavior, security
   handling, or template output as appropriate.
4. Run `bun run lint` and `bun test` before publishing or opening a pull
   request.
5. Keep the README focused on user commands; put deeper rationale in `docs/`.
