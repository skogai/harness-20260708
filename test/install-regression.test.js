import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  lstat,
  mkdtemp,
  readFile,
  rm,
  mkdir,
  writeFile,
  readdir,
} from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

import {
  copyAgentEssentials,
  copyAgentSkills,
  copyAll,
  copyCommands,
  copySkills,
  copyToonUtils,
  isAgentSkillInstalled,
  isSkillInstalled,
  normalizeSkillPath,
  writeCodexAgentsFile,
} from "../src/utils/copy.js";
import { setupToonBinary } from "../src/utils/toon.js";
import { parseAgentTargets } from "../src/agents.js";

const execFileAsync = promisify(execFile);

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), "harness-test-"));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test("agent target parser supports aliases and rejects unknown targets", () => {
  assert.deepEqual(parseAgentTargets("claude,codex"), ["claude", "codex"]);
  assert.deepEqual(parseAgentTargets("all"), ["claude", "codex"]);
  assert.throws(() => parseAgentTargets("windsurf"), /Unknown agent target/);
});

test("profile skill paths install under .claude/skills/<id>", async (t) => {
  const dir = await withTempDir(t);

  await copySkills(dir, ["toon-formatter"]);

  assert.equal(
    existsSync(join(dir, ".claude", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
  assert.equal(existsSync(join(dir, ".claude", "skills", "skills")), false);
  assert.equal(await isSkillInstalled(dir, "toon-formatter"), true);
});

test("codex target installs local skills and root AGENTS guidance", async (t) => {
  const dir = await withTempDir(t);

  await copyAgentEssentials(dir, "codex");
  await copyAgentSkills(dir, "codex", ["toon-formatter"]);
  await writeCodexAgentsFile(dir, ["toon-formatter"]);

  assert.equal(
    existsSync(join(dir, ".codex", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
  assert.equal(existsSync(join(dir, "AGENTS.md")), true);
  assert.equal(
    await isAgentSkillInstalled(dir, "codex", "toon-formatter"),
    true,
  );

  const codexSkillPath = join(
    dir,
    ".codex",
    "skills",
    "toon-formatter",
    "SKILL.md",
  );
  assert.equal((await lstat(codexSkillPath)).isSymbolicLink(), false);

  const codexAgents = await readFile(join(dir, "AGENTS.md"), "utf8");
  assert.match(codexAgents, /toon-formatter/);
  assert.doesNotMatch(codexAgents, />-/);
});

test("legacy skills/<id> inputs normalize to the current destination", async (t) => {
  const dir = await withTempDir(t);

  await copySkills(dir, ["skills/toon-formatter"]);

  assert.equal(normalizeSkillPath("skills/toon-formatter"), "toon-formatter");
  assert.equal(
    existsSync(join(dir, ".claude", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
  assert.equal(
    existsSync(join(dir, ".claude", "skills", "skills", "toon-formatter")),
    false,
  );
});

test("copySkills preflights all requested skills before writing", async (t) => {
  const dir = await withTempDir(t);

  await assert.rejects(
    copySkills(dir, ["toon-formatter", "missing-skill"]),
    /Skill not found: missing-skill/,
  );

  assert.equal(
    existsSync(join(dir, ".claude", "skills", "toon-formatter")),
    false,
  );
});

test("copyCommands rejects traversal before creating command output", async (t) => {
  const dir = await withTempDir(t);

  await assert.rejects(
    copyCommands(dir, ["../escape"]),
    /Invalid command name/,
  );

  assert.equal(existsSync(join(dir, ".claude", "commands")), false);
});

test("TOON wrapper is copied and verified for selective installs", async (t) => {
  const dir = await withTempDir(t);

  await copyToonUtils(dir);
  const result = setupToonBinary(join(dir, ".claude"));

  assert.equal(result.success, true);
  assert.equal(result.path, join(dir, ".claude", "utils", "toon", "cli.mjs"));
});

test("copyAll --force replaces an existing .claude and leaves no staging or backup residue", async (t) => {
  const dir = await withTempDir(t);
  const claudeDir = join(dir, ".claude");
  await mkdir(claudeDir, { recursive: true });
  await writeFile(join(claudeDir, "stale-sentinel.txt"), "old", "utf8");

  await copyAll(dir, { force: true });

  assert.equal(existsSync(join(claudeDir, "stale-sentinel.txt")), false);
  assert.equal(existsSync(join(claudeDir, "settings.json")), true);

  const residue = (await readdir(dir)).filter(
    (entry) =>
      entry.startsWith(".claude-install-") ||
      entry.startsWith(".claude.backup."),
  );
  assert.deepEqual(residue, []);
});

test("copyAll refuses to clobber an existing .claude without force or merge", async (t) => {
  const dir = await withTempDir(t);
  await mkdir(join(dir, ".claude"), { recursive: true });

  await assert.rejects(copyAll(dir, {}), /already exists/);
});

test("copyAll never copies local settings overrides", async (t) => {
  const dir = await withTempDir(t);

  await copyAll(dir, {});

  assert.equal(existsSync(join(dir, ".claude", "settings.local.json")), false);
  assert.equal(
    existsSync(join(dir, ".claude", "settings.local.json.example")),
    false,
  );
});

test("CLI explicit init subcommand respects non-interactive options", async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve("bin/cli.js");

  await execFileAsync(process.execPath, [
    cliPath,
    "init",
    dir,
    "--yes",
    "--profile",
    "minimal",
  ]);

  assert.equal(
    existsSync(join(dir, ".claude", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
  assert.equal(
    existsSync(join(dir, ".claude", "utils", "toon", "cli.mjs")),
    true,
  );
  assert.equal(existsSync(join(dir, ".claude", "skills", "skills")), false);
});

test("CLI can install all supported agent targets", async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve("bin/cli.js");

  await execFileAsync(process.execPath, [
    cliPath,
    "init",
    dir,
    "--yes",
    "--agent",
    "all",
    "--skills",
    "toon-formatter",
  ]);

  assert.equal(
    existsSync(join(dir, ".claude", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
  assert.equal(
    existsSync(join(dir, ".codex", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
  assert.equal(existsSync(join(dir, "AGENTS.md")), true);
});

test("CLI codex-only install does not emit a Claude target", async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve("bin/cli.js");

  await execFileAsync(process.execPath, [
    cliPath,
    "init",
    dir,
    "--yes",
    "--agent",
    "codex",
    "--skills",
    "toon-formatter",
  ]);

  assert.equal(
    existsSync(join(dir, ".codex", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
  assert.equal(existsSync(join(dir, "AGENTS.md")), true);
  assert.equal(existsSync(join(dir, ".claude")), false);
});

test("CLI deduplicates repeated explicit skill ids before installing", async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve("bin/cli.js");

  await execFileAsync(process.execPath, [
    cliPath,
    "init",
    dir,
    "--yes",
    "--agent",
    "codex",
    "--skills",
    "toon-formatter,toon-formatter",
  ]);

  const manifest = JSON.parse(await readFile(join(dir, "skogai.json"), "utf8"));
  assert.deepEqual(manifest.skills, ["toon-formatter"]);
  assert.equal(
    existsSync(join(dir, ".codex", "skills", "toon-formatter", "SKILL.md")),
    true,
  );
});
