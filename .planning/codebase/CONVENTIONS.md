# Coding Conventions

**Analysis Date:** 2026-07-08

## Naming Patterns

**Files:**
- Use kebab-case for multi-word runtime and test files: `src/utils/managed-block.js`, `src/commands/harness-init.js`, `test/manifest-sync.test.js`, `test/security-hardening.test.js`.
- Use command names as file names under `src/commands/`: `src/commands/init.js`, `src/commands/sync.js`, `src/commands/status.js`, `src/commands/add.js`.
- Use concise domain names for top-level modules: `src/manifest.js`, `src/mcps.js`, `src/agents.js`, `src/profiles.js`.

**Functions:**
- Use camelCase and action-oriented names: `validateManifest()` in `src/manifest.js`, `resolveManifest()` in `src/manifest.js`, `collectEnvReferences()` in `src/mcps.js`, `parseAgentTargets()` in `src/agents.js`.
- Prefix boolean validators with `is`: `isPathSafe()`, `isValidSkillPath()`, and `isValidCommandName()` in `src/utils/security.js`; `isSkillInstalled()` and `isAgentSkillInstalled()` in `src/utils/copy.js`.
- Use `run<Name>()` for testable command internals and `<name>()` for CLI-facing wrappers that handle console output and exits: `runSync()` and `sync()` in `src/commands/sync.js`.
- Keep small private helpers unexported near the code that uses them: `readJsonIfExists()` and `writeMcpServersJson()` in `src/commands/sync.js`; `parseKeyValuePairs()` in `src/commands/add.js`.

**Variables:**
- Use camelCase for locals and parameters: `targetDir`, `manifestPath`, `agentTargets`, `installPlan`, `envVars` in `src/commands/init.js` and `src/commands/sync.js`.
- Use UPPER_SNAKE_CASE for module constants that are configuration or catalogs: `MANIFEST_FILENAME`, `MANIFEST_VERSION` in `src/manifest.js`; `MCP_CATALOG` in `src/mcps.js`; `STATE_FILES` in `src/commands/harness-init.js`.
- Use descriptive collection names: `missingSkills`, `drifted`, `unmanaged` in `src/commands/status.js`; `knownSkillIds` and `unknownSkillIds` in `src/commands/init.js`.

**Types:**
- JavaScript is untyped; use object shapes documented by validation functions instead of TypeScript interfaces. Manifest shape is enforced in `validateManifest()` in `src/manifest.js`; MCP entry shape is enforced in `validateMcpEntry()` in `src/mcps.js`.
- Use plain objects for structured reports and plans: `resolveManifest()` returns `{ profile, targets, skills, mcps, model, commands, toon, hooks }` in `src/manifest.js`; `getStatus()` returns `{ plan, targets, inSync }` in `src/commands/status.js`.

## Code Style

**Formatting:**
- No Prettier config is present; formatting is convention-based and linted by ESLint in `eslint.config.js`.
- Use two-space indentation, semicolons, and trailing commas in multiline arrays/objects/calls. Examples: `src/commands/init.js`, `src/commands/sync.js`, and `test/manifest-sync.test.js`.
- Use single quotes for new JavaScript. Most runtime files use single quotes (`src/manifest.js`, `src/mcps.js`, `src/commands/sync.js`); `AGENTS.md` line 18 explicitly prescribes single quotes. `src/utils/copy.js` contains double-quoted strings; do not copy that style into new files.
- Keep lines readable by splitting long conditions and multiline function calls, as in `validateManifest()` in `src/manifest.js` and `upsertManagedBlock()` calls in `src/commands/sync.js`.

**Linting:**
- Use ESLint flat config in `eslint.config.js`.
- Lint command: `bun run lint` from `package.json`.
- ESLint applies `@eslint/js` recommended rules to `src/**/*.js`, `test/**/*.js`, `bin/**/*.js`, `bench/**/*.mjs`, and `templates/.claude/utils/**/*.mjs` in `eslint.config.js`.
- Unused function arguments are allowed only when prefixed with `_` via `no-unused-vars` `argsIgnorePattern: '^_'` in `eslint.config.js`.
- Global variables are limited to `console` and `process` for Node files in `eslint.config.js`.

## Import Organization

**Order:**
1. External packages first: `chalk`, `ora`, `inquirer`, `commander`, `fs-extra` in `src/commands/init.js`, `src/commands/sync.js`, and `bin/cli.js`.
2. Node built-ins next. Runtime files commonly use bare built-ins (`fs/promises`, `path`, `url`) as in `src/manifest.js`; tests use `node:` built-ins (`node:test`, `node:assert/strict`, `node:fs/promises`) as in `test/manifest-sync.test.js`.
3. Local relative imports last, with explicit `.js` extensions: `../manifest.js`, `../mcps.js`, `../utils/copy.js` in `src/commands/sync.js`; `../src/manifest.js` in `test/manifest-sync.test.js`.
4. Separate test framework/built-ins from source imports with a blank line, as in `test/manifest-sync.test.js`, `test/install-regression.test.js`, and `test/skill-quality.test.js`.

**Path Aliases:**
- No path aliases are configured. Use relative imports with explicit `.js` extensions in runtime and tests.
- Use `node:` prefixes in tests for built-ins: `node:test`, `node:assert/strict`, `node:fs/promises` in `test/*.test.js`.

## Error Handling

**Patterns:**
- Validation helpers throw `Error` with actionable messages; use this style for invalid manifest, MCP, path, and command input. Examples: `validateManifest()` in `src/manifest.js`, `validateMcpEntry()` in `src/mcps.js`, `normalizeSkillPath()` in `src/utils/copy.js`.
- Preserve lower-level parse or IO causes with `new Error(message, { cause: error })` when rethrowing: `loadManifest()` in `src/manifest.js`, `readJsonIfExists()` in `src/commands/sync.js`, and `replaceDirectory()` in `src/utils/copy.js`.
- CLI-facing functions catch, print colored user messages, and exit with failure: `sync()` in `src/commands/sync.js`, `addMcp()` and `addSkill()` in `src/commands/add.js`, `init()` in `src/commands/init.js`, `harnessInit()` in `src/commands/harness-init.js`.
- Testable command internals should throw instead of exiting. Use `runSync()` in `src/commands/sync.js` and `getStatus()` in `src/commands/status.js` as the pattern.
- For non-fatal status failures, prefer `process.exitCode = 1` over immediate exit when the command can finish rendering its report: `status()` in `src/commands/status.js`.
- Sanitize user-controlled paths and names in error output with `sanitizeForLog()` from `src/utils/security.js` when values can include control characters.

## Logging

**Framework:** console with `chalk` and `ora`

**Patterns:**
- CLI commands print user-facing success and failure messages with `console.log()` / `console.error()` and `chalk`: `src/commands/init.js`, `src/commands/sync.js`, `src/commands/status.js`, `src/commands/add.js`.
- Long-running install/scaffold flows use `ora` spinners: `init()` in `src/commands/init.js` and `harnessInit()` in `src/commands/harness-init.js`.
- Library-style helpers in `src/manifest.js`, `src/mcps.js`, `src/agents.js`, and `src/utils/security.js` should not log; return values or throw errors instead.
- Do not log secret values. Environment handling prints variable names only, such as `GITHUB_PERSONAL_ACCESS_TOKEN`, in `src/commands/sync.js` and `src/commands/init.js`.

## Comments

**When to Comment:**
- Use comments for security constraints and non-obvious preservation semantics: path traversal and ReDoS notes in `src/utils/security.js`; managed MCP preservation in `src/commands/sync.js`; MCP catalog override semantics in `src/mcps.js`.
- Use comments to mark test sections only when a file covers multiple related security or regression groups, as in `test/security-hardening.test.js`.
- Avoid comments that repeat a function name or obvious code. Prefer descriptive function names such as `copyAgentEssentials()` in `src/utils/copy.js` and `detectVerificationCommands()` in `src/commands/harness-init.js`.

**JSDoc/TSDoc:**
- JSDoc is lightweight and used for exported helpers or nuanced behavior, not complete API documentation. Examples: `resolveManifest()` in `src/manifest.js`, `collectEnvReferences()` and `buildMcpServersMap()` in `src/mcps.js`, and `copySkill()` in `src/utils/copy.js`.
- Keep JSDoc current-state only and include the behavior that callers rely on.

## Function Design

**Size:**
- Keep validators and pure transformers compact and directly testable: `validateMcpEntry()` in `src/mcps.js`, `formatAgentTargets()` in `src/agents.js`, `sanitizeForLog()` in `src/utils/security.js`.
- Larger command functions are acceptable when they orchestrate CLI prompts, spinners, writes, and output. Keep reusable work factored into helpers: `init()` delegates to `writeManifest()`, `findExistingAgentTargets()`, `installClaude()`, and `installCodex()` in `src/commands/init.js`.
- For filesystem utilities, isolate safety checks and write steps in small helpers before exposing aggregate operations. Use `rejectSymlink()`, `assertRegularTemplateFile()`, `writeGeneratedFile()`, and `copyAgentSkills()` in `src/utils/copy.js` as the model.

**Parameters:**
- Use default parameters for CLI entry points and helper options: `dir = '.'`, `options = {}` in `sync()`, `runSync()`, `status()`, `getStatus()`, and `init()`.
- Pass options objects for flags that can grow: `copyAll(targetDir, options)`, `copyAgentSkills(targetDir, agent, skillPaths, options)`, `harnessInit(dir, options)`.
- Keep required domain inputs positional when they are few and stable: `validateMcpEntry(entry)`, `getCatalogMcp(name)`, `parseAgentTargets(value)`.

**Return Values:**
- Return structured data from internals that tests can assert: `runSync()` returns `{ plan, envVars, addedEnvExampleVars, unsetVars }` in `src/commands/sync.js`; `getStatus()` returns a status report in `src/commands/status.js`; `harnessInit()` returns result entries in `src/commands/harness-init.js`.
- Return paths from write/copy helpers when useful for callers: `saveManifest()` in `src/manifest.js`, `copyAll()` and `copySkill()` in `src/utils/copy.js`.
- Return `null` for absent optional files instead of throwing when absence is normal: `loadManifest()` in `src/manifest.js`, `readJsonIfExists()` in `src/commands/sync.js` and `src/commands/status.js`.

## Module Design

**Exports:**
- Prefer named exports for public helpers and command entry points. Examples: `export function validateManifest()` in `src/manifest.js`, `export async function runSync()` in `src/commands/sync.js`, `export async function copyAgentSkills()` in `src/utils/copy.js`.
- Use default export only for configuration files that expect it: `eslint.config.js`.
- Keep CLI wiring in `bin/cli.js`; command implementations belong in `src/commands/<name>.js`.
- Keep reusable filesystem and security helpers in `src/utils/`; use domain modules for manifest, agent, MCP, and profile logic in `src/manifest.js`, `src/agents.js`, `src/mcps.js`, and `src/profiles.js`.

**Barrel Files:**
- `src/index.js` is a package barrel that re-exports selected public helpers from `src/utils/toon.js`, `src/utils/copy.js`, and `src/profiles.js`.
- Do not add broad barrel exports by default. Import command and utility modules directly from their concrete files, as `bin/cli.js` imports `src/commands/init.js` and tests import `../src/manifest.js`.

---

*Convention analysis: 2026-07-08*
