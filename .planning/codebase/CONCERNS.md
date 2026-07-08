# Codebase Concerns

**Analysis Date:** 2026-07-08

## Tech Debt

**Installer copy pipeline is too broad:**
- Issue: `src/utils/copy.js` owns skill path normalization, template directory resolution, symlink rejection, frontmatter parsing, Claude install layout, Codex install layout, managed guidance generation, command copying, hook copying, and TOON utility copying in one 578-line module.
- Files: `src/utils/copy.js`
- Impact: Changes to one install target can regress unrelated targets because security checks, path construction, and generated content live in the same module. The most fragile functions are `copyAll`, `copySkill`, `copyCodexSkill`, `copyAgentSkill`, `writeCodexAgentsFile`, `copyCommands`, and `copyHooks` in `src/utils/copy.js`.
- Fix approach: Split `src/utils/copy.js` into focused modules such as `src/utils/template-paths.js`, `src/utils/skill-install.js`, `src/utils/claude-install.js`, and `src/utils/codex-install.js`. Keep all path safety checks in one shared helper and keep target-specific output rendering separate.

**Harness initialization logic exists in multiple places:**
- Issue: Package-manager detection and verification command generation are implemented in both the shipped CLI and the bundled harness-creator utility, while a static shell template also contains another copy of similar behavior.
- Files: `src/commands/harness-init.js`, `templates/.claude/skills/harness-creator/scripts/lib/harness-utils.mjs`, `templates/.claude/skills/harness-creator/templates/init.sh`
- Impact: Generated `init.sh` behavior can diverge depending on whether a user runs `skogharness harness-init`, invokes `harness-creator` scripts, or copies the static template. Python handling already differs: `templates/.claude/skills/harness-creator/scripts/lib/harness-utils.mjs` has stack detection and Python verification command generation, while `src/commands/harness-init.js` only handles `package.json` projects and a generic fallback.
- Fix approach: Move verification-command detection into one reusable implementation under `src/` or a shared template script, then have `src/commands/harness-init.js` and `templates/.claude/skills/harness-creator/scripts/lib/harness-utils.mjs` consume the same logic or share generated fixtures tested against each supported stack.

**Manual frontmatter parser is duplicated and partial:**
- Issue: Frontmatter parsing is custom and duplicated, with limited YAML support for simple `key: value` pairs and block scalar variants.
- Files: `src/utils/copy.js`, `test/skill-quality.test.js`
- Impact: Skill metadata containing colons, lists, comments, folded text edge cases, or quoted values can parse differently in production and tests. `src/utils/copy.js` drives generated `AGENTS.md` and Codex `SKILL.md` metadata, while `test/skill-quality.test.js` reimplements similar parsing rather than asserting through the production parser.
- Fix approach: Export one parser from `src/utils/copy.js` or a new `src/utils/skill-metadata.js`, test it directly, and use it from `test/skill-quality.test.js`. If richer metadata is needed, use a YAML parser dependency instead of expanding the custom parser.

**CLI command handlers terminate the process directly:**
- Issue: Command functions call `process.exit(1)` in catch blocks instead of throwing typed errors to the CLI boundary.
- Files: `src/commands/init.js`, `src/commands/add.js`, `src/commands/status.js`, `src/commands/harness-init.js`, `src/commands/sync.js`
- Impact: Unit tests and embedders cannot call these command handlers and inspect errors without process-level side effects. This also makes recovery and cleanup harder when a command fails after writing some files.
- Fix approach: Return structured results or throw errors from command modules, and centralize `process.exitCode` / `process.exit()` behavior in `bin/cli.js`.

**Temporal comments remain in tests:**
- Issue: Test comments label cases as fixes rather than describing the behavior under test.
- Files: `test/security-hardening.test.js`
- Impact: Comments such as `// ── FIX 5: Command name validation` and `// ── FIX 4: settings.local.json renamed to .example` in `test/security-hardening.test.js` encode change history rather than current intent, which conflicts with the repository convention that comments describe what code does now.
- Fix approach: Rename the sections to current-state headings such as `Command name validation` and `Local settings templates`.

## Known Bugs

**Codex MCP status misses drift:**
- Symptoms: `harness status` can report Codex MCP configuration as in sync when `.codex/config.toml` contains the expected `[mcp_servers.<name>]` section name but the command, URL, args, env, or headers differ from `skogai.json`.
- Files: `src/commands/status.js`, `src/mcps.js`, `test/manifest-sync.test.js`
- Trigger: Generate Codex MCP config with `runSync`, edit the managed block in `.codex/config.toml` so `[mcp_servers.github]` remains but `command` or `args` differ, then call `getStatus()` from `src/commands/status.js`.
- Workaround: Run `harness sync` to rewrite the managed block from `skogai.json`; do not rely on `harness status` for Codex MCP value drift until `diffCodexMcps` compares rendered TOML content.

**CLI MCP args parser drops quoting semantics:**
- Symptoms: `harness add mcp <name> --command ... --args ...` splits the `--args` value on every space, so quoted arguments or argument values containing spaces are not preserved.
- Files: `src/commands/add.js`, `bin/cli.js`
- Trigger: Pass an argument such as `--args "--label My Project"` through `bin/cli.js`; `src/commands/add.js` stores `['--label', 'My', 'Project']` rather than preserving the intended value.
- Workaround: Edit `skogai.json` directly and store `mcps[].args` as an explicit JSON string array.

**Invalid `.mcp.json` is treated as missing config during status:**
- Symptoms: `harness status` does not surface JSON parse errors for `.mcp.json`; it treats the file as absent and reports missing MCPs rather than a corrupted config file.
- Files: `src/commands/status.js`
- Trigger: Put invalid JSON in `.mcp.json` and run `harness status` for a manifest with Claude MCP entries.
- Workaround: Run `harness sync` to rewrite managed MCP entries, or manually validate `.mcp.json` before using `harness status` for drift analysis.

## Security Considerations

**Literal MCP secrets can be written into committed config:**
- Risk: The CLI accepts raw `--env KEY=VALUE` and `--header KEY=VALUE` pairs and writes them into `skogai.json`, `.mcp.json`, and managed Codex TOML if users pass literal secret values rather than `${VAR}` placeholders.
- Files: `bin/cli.js`, `src/commands/add.js`, `src/manifest.js`, `src/mcps.js`, `src/commands/sync.js`
- Current mitigation: Catalog MCPs in `src/mcps.js` use placeholder values such as `${GITHUB_PERSONAL_ACCESS_TOKEN}`, `collectEnvReferences()` in `src/mcps.js` documents placeholder variables in `.env.example`, and `AGENTS.md` instructs contributors to avoid real tokens.
- Recommendations: Reject or warn on likely literal secrets in `validateMcpEntry()` in `src/mcps.js`; require `${VAR}` placeholders for `env` and sensitive `headers`; add tests in `test/manifest-sync.test.js` covering literal-secret rejection and safe placeholder acceptance.

**Symlink checks have time-of-check/time-of-use exposure:**
- Risk: Template copying rejects symlinks before copying, but checks and copy operations are separate filesystem actions.
- Files: `src/utils/copy.js`
- Current mitigation: `rejectSymlink()` and `assertRegularTemplateFile()` in `src/utils/copy.js` use `lstat()` and reject symlinks for template roots, files, command templates, support files, and copy filters.
- Recommendations: Keep template sources immutable in the packaged installation path, and prefer copy primitives that open verified regular files directly when handling user-writable template roots. Add regression tests that create symlinks under `templates/.claude/skills` and `templates/.claude/commands` and assert no destination file is written.

**Secret scanner is a template hook, not package enforcement:**
- Risk: `templates/.claude/hooks/secret-scanner.sh` protects generated target projects only if users install hooks and their agent runtime invokes them; the package's own publish and test flow does not run that scanner.
- Files: `templates/.claude/hooks/secret-scanner.sh`, `src/profiles.js`, `package.json`
- Current mitigation: `templates/.claude/hooks/secret-scanner.sh` scans common token patterns and exits non-zero when it detects potential secrets. `AGENTS.md` has manual security guidance.
- Recommendations: Add repository-level secret scanning to `package.json` scripts or CI, and include a test that the hook is installed when a profile enables hooks in `src/profiles.js`.

**Generated hook files may not be executable after copy in all package environments:**
- Risk: Hook templates under `templates/.claude/hooks/` rely on copy behavior preserving executable mode; `copyHooks()` does not explicitly chmod shell files.
- Files: `src/utils/copy.js`, `templates/.claude/hooks/secret-scanner.sh`, `templates/.claude/hooks/file-size-monitor.sh`, `templates/.claude/hooks/toon-validator.sh`, `templates/.claude/hooks/markdown-formatter.sh`, `templates/.claude/hooks/settings-backup.sh`
- Current mitigation: Source files are shell scripts with shebangs, and `copyHooks()` uses `fs-extra` copy from `src/utils/copy.js`.
- Recommendations: After `copyHooks()` copies files, chmod `*.sh` files to `0o755` and add an install regression test in `test/install-regression.test.js` that verifies generated hooks are executable.

## Performance Bottlenecks

**Full sync recopies all selected skills every run:**
- Problem: `runSync()` copies every planned skill for every target with `force: true`, even when templates and generated files are unchanged.
- Files: `src/commands/sync.js`, `src/utils/copy.js`
- Cause: `syncClaude()` and `syncCodex()` in `src/commands/sync.js` call `copyAgentSkills()` with `force: true`; `copyAgentSkills()` in `src/utils/copy.js` recurses through each skill directory and writes target files.
- Improvement path: Add content-hash or mtime checks before writing generated skill files, and keep a sync manifest for generated files under managed markers or package metadata.

**Project detection walks a capped file list:**
- Problem: Harness assessment and generated verification detection can miss files in repositories with more than the configured scan limit.
- Files: `templates/.claude/skills/harness-creator/scripts/lib/harness-utils.mjs`
- Cause: `detectProject()` calls `listFiles(root, { maxFiles: 800 })`, and `listFiles()` stops traversal once the limit is reached.
- Improvement path: Detect stack from targeted known files before performing broad traversal, and make the cap configurable or report truncation in generated assessment output.

## Fragile Areas

**Managed block replacement relies on string markers:**
- Files: `src/utils/managed-block.js`, `src/commands/sync.js`, `src/commands/status.js`
- Why fragile: `upsertManagedBlock()` in `src/utils/managed-block.js` uses `indexOf()` for begin/end markers and replaces the first matching region. User edits that duplicate or partially remove markers cause sync failures or ambiguous replacement.
- Safe modification: Keep marker tags unique (`harness:skills`, `harness:mcp`) and add tests for duplicate begin markers, duplicate end markers, and nested marker text inside generated content.
- Test coverage: `test/manifest-sync.test.js` covers idempotent replacement and corrupted one-sided marker detection indirectly, but it does not cover duplicate marker ambiguity.

**Profile behavior is hard-coded:**
- Files: `src/profiles.js`, `src/commands/init.js`, `src/manifest.js`, `test/manifest-sync.test.js`, `test/install-regression.test.js`
- Why fragile: Adding a new profile, command list, hook behavior, or skill category requires edits in `src/profiles.js` plus expectations across installer and manifest tests. `src/commands/init.js` has special behavior where installing all skills copies the whole Claude template, while selective installs copy essentials, commands, hooks, and skills separately.
- Safe modification: Add profile tests before changing `src/profiles.js`, especially for `copyWholeClaudeTemplate`, `hooks`, `commands`, and `toon` interactions in `src/commands/init.js`.
- Test coverage: `test/install-regression.test.js` covers minimal and explicit install paths; add explicit tests for the `all` profile with hooks and command output.

**TOON wrapper setup validates only file presence:**
- Files: `src/utils/toon.js`, `src/utils/copy.js`, `templates/.claude/utils/toon/cli.mjs`, `test/install-regression.test.js`
- Why fragile: `setupToonBinary()` confirms the wrapper exists, is not a symlink, and is a file, but it does not validate executable permissions, syntax, or runtime dependency availability.
- Safe modification: Treat `setupToonBinary()` as an integrity check and add a separate smoke test that invokes `templates/.claude/utils/toon/cli.mjs validate` or `count` against a small fixture.
- Test coverage: `test/install-regression.test.js` only asserts that `setupToonBinary()` returns success for a copied wrapper.

## Scaling Limits

**Skill registry is static:**
- Current capacity: Two registered skills are listed in `src/profiles.js`: `harness-creator` and `toon-formatter`.
- Limit: Every shipped skill must be added to `SKILLS` manually, and tests in `test/skill-quality.test.js` only verify that registered skills have templates, not that every top-level skill template is registered.
- Scaling path: Generate `SKILLS` from `templates/.claude/skills/*/skill.md` metadata or add a test that fails when a top-level skill exists without a matching `SKILLS` entry in `src/profiles.js`.

**Catalog MCPs are embedded in code:**
- Current capacity: Four catalog MCP entries exist in `src/mcps.js`: `github`, `neon`, `stripe`, and `resend`.
- Limit: Adding or updating catalog entries requires source changes and release workflow, and there is no schema fixture for external catalog updates.
- Scaling path: Move catalog data to a JSON file with schema validation, keep `src/mcps.js` focused on validation/rendering, and test catalog fixtures in `test/manifest-sync.test.js`.

## Dependencies at Risk

**Commander major version is very new:**
- Risk: `commander` is pinned to `15.0.0`, while the package supports Node `>=18.0.0` in `package.json`.
- Impact: CLI parsing behavior in `bin/cli.js`, especially variadic options such as `--env <pair...>` and `--header <pair...>`, can be sensitive to Commander major-version changes.
- Migration plan: Keep CLI integration tests in `test/install-regression.test.js` and add tests for `harness add mcp` option parsing. Pin known-good versions in `bun.lock` and evaluate Node engine compatibility during dependency updates.

**Template utility dependencies are declared as dev dependencies:**
- Risk: `templates/.claude/utils/toon/cli.mjs` imports `@toon-format/toon` and optionally `gpt-tokenizer`, but both are listed under `devDependencies` in `package.json`.
- Impact: The generated target project may receive a TOON wrapper without the required runtime packages installed, causing `/toon-*` commands to fail until users install dependencies manually.
- Migration plan: Either bundle the required runtime code, move required packages to `dependencies`, or have install commands update target project guidance with exact installation steps. Keep the current visible install hint in `templates/.claude/utils/toon/cli.mjs`.

## Missing Critical Features

**No automated release/publish verification beyond package script:**
- Problem: `package.json` defines `prepublishOnly`, but the repository has no detected CI workflow file and no release-specific packaging test that installs the packed tarball and exercises `bin/cli.js`.
- Blocks: Package consumers can hit missing files, incorrect executable modes, or dependency omissions that local source-tree tests do not catch.

**No manifest schema export:**
- Problem: `skogai.json` validation lives in JavaScript functions, but there is no JSON Schema for editor validation or docs tooling.
- Blocks: Users must run `harness sync` or `harness status` to discover shape errors in `skogai.json`.

## Test Coverage Gaps

**Codex MCP drift detection:**
- What's not tested: `diffCodexMcps()` content drift for command, URL, args, env, and headers.
- Files: `src/commands/status.js`, `test/manifest-sync.test.js`
- Risk: `harness status` can falsely report Codex MCP config as synchronized.
- Priority: High

**Literal secret rejection:**
- What's not tested: Rejection or warning behavior for literal `env` and `headers` values in MCP entries.
- Files: `src/mcps.js`, `src/commands/add.js`, `test/manifest-sync.test.js`, `test/security-hardening.test.js`
- Risk: Users can commit real tokens in `skogai.json`, `.mcp.json`, or `.codex/config.toml`.
- Priority: High

**Hook install mode and profile hook behavior:**
- What's not tested: Executable bits for generated hook scripts and install behavior for profiles that enable hooks.
- Files: `src/utils/copy.js`, `src/profiles.js`, `templates/.claude/hooks/secret-scanner.sh`, `test/install-regression.test.js`
- Risk: Installed hooks can fail silently or never execute in target projects.
- Priority: Medium

**CLI `add mcp` integration:**
- What's not tested: End-to-end `bin/cli.js add mcp` behavior for catalog MCPs, explicit stdio MCPs, remote MCPs, env/header parsing, and args parsing.
- Files: `bin/cli.js`, `src/commands/add.js`, `src/mcps.js`, `test/install-regression.test.js`
- Risk: Manifest and sync helpers can pass unit tests while user-facing CLI parsing stores incorrect MCP config.
- Priority: High

**Generated `harness-init` stack coverage:**
- What's not tested: Generated `init.sh` content for Python, Go, Rust, Maven, Gradle, .NET, and generic projects.
- Files: `src/commands/harness-init.js`, `templates/.claude/skills/harness-creator/scripts/lib/harness-utils.mjs`, `templates/.claude/skills/harness-creator/templates/init.sh`
- Risk: Non-Node users receive weak or placeholder verification commands despite the harness-creator utilities having broader stack detection.
- Priority: Medium

---

*Concerns audit: 2026-07-08*
