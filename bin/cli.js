#!/usr/bin/env node

import { program } from 'commander';
import { init } from '../src/commands/init.js';
import { harnessInit } from '../src/commands/harness-init.js';
import { sync } from '../src/commands/sync.js';
import { status } from '../src/commands/status.js';
import { addMcp, addSkill } from '../src/commands/add.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

program
  .name('harness')
  .version(pkg.version)
  .description('skogai/harness: TOON token-optimization skill pack for Claude Code and Codex');

program
  .command('init [dir]', { isDefault: true })
  .description('Initialize harness in directory')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-f, --force', 'Overwrite existing files')
  .option('--agent <list>', 'Agent target(s): claude, codex, or all', 'claude')
  .option('--profile <name>', 'Use preset profile (all, minimal, custom)')
  .option('--skills <list>', 'Comma-separated skills to install')
  .option('--no-toon', 'Skip TOON utilities')
  .action(init);

program
  .command('harness-init [dir]')
  .description('Scaffold state & lifecycle files: feature_list.json, progress.md, session-handoff.md, init.sh')
  .option('-f, --force', 'Overwrite existing files')
  .option('--package-manager <name>', 'Package manager: npm, pnpm, yarn, bun')
  .option('--commands <list>', 'Comma-separated verification commands (overrides auto-detection)')
  .action(harnessInit);

program
  .command('sync [dir]')
  .description('Write native agent config (skills, MCP servers) for every target declared in skogai.json')
  .action(sync);

program
  .command('status [dir]')
  .description('Diff skogai.json against the native config of each target; exits 1 on drift')
  .action(status);

const add = program
  .command('add')
  .description('Add an entry to skogai.json and re-sync');

add
  .command('mcp <name>')
  .description('Add an MCP server by catalog name, or with explicit --command/--url')
  .option('--dir <dir>', 'Project directory', '.')
  .option('--command <command>', 'Executable for a stdio MCP server')
  .option('--args <args>', 'Space-separated arguments for --command')
  .option('--url <url>', 'https URL for a remote MCP server')
  .option('--env <pair...>', 'Environment variables as KEY=VALUE (repeatable)')
  .option('--header <pair...>', 'HTTP headers as KEY=VALUE (repeatable, remote servers only)')
  .action(addMcp);

add
  .command('skill <name>')
  .description('Add a skill from the harness skill set')
  .option('--dir <dir>', 'Project directory', '.')
  .action(addSkill);

program.parse();
