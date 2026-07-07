import chalk from 'chalk';
import ora from 'ora';
import { join, resolve } from 'path';
import { pathExists, ensureDir } from 'fs-extra';
import { readFile, writeFile, chmod } from 'fs/promises';
import { getSkillsDir } from '../utils/copy.js';

const STATE_FILES = {
  'feature_list.json': 'feature-list.json',
  'progress.md': 'progress.md',
  'session-handoff.md': 'session-handoff.md',
};

function getHarnessCreatorTemplatesDir() {
  return join(getSkillsDir(), 'harness-creator', 'templates');
}

async function detectPackageManager(targetDir, explicit) {
  if (explicit) return explicit;
  if (await pathExists(join(targetDir, 'bun.lock')) || await pathExists(join(targetDir, 'bun.lockb'))) return 'bun';
  if (await pathExists(join(targetDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await pathExists(join(targetDir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function runCommand(script, packageManager) {
  if (packageManager === 'npm') return `npm run ${script}`;
  if (packageManager === 'yarn') return `yarn ${script}`;
  return `${packageManager} run ${script}`;
}

async function detectVerificationCommands(targetDir, packageManager) {
  const packageJsonPath = join(targetDir, 'package.json');
  if (!(await pathExists(packageJsonPath))) {
    return ['echo "No package manifest detected; replace this line with your project verification command."'];
  }

  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts || {};
  const install = packageManager === 'npm' ? 'npm install' : packageManager === 'yarn' ? 'yarn install' : `${packageManager} install`;
  const candidates = [
    scripts.check ? runCommand('check', packageManager) : null,
    scripts.typecheck ? runCommand('typecheck', packageManager) : null,
    scripts['type-check'] ? runCommand('type-check', packageManager) : null,
    scripts.lint ? runCommand('lint', packageManager) : null,
    scripts.test ? (packageManager === 'npm' ? 'npm test' : `${packageManager} test`) : null,
    scripts.build ? runCommand('build', packageManager) : null,
  ].filter(Boolean);

  return [install, ...new Set(candidates)];
}

function initScriptFromCommands(commands) {
  const body = commands
    .map((command) => `echo "=== ${command.replaceAll('"', '\\"')} ==="\n${command}`)
    .join('\n\n');

  return `#!/bin/bash
set -e

echo "=== Harness Initialization ==="

${body}

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state"
echo "2. Pick ONE unfinished feature to work on"
echo "3. Implement only that feature"
echo "4. Re-run verification before claiming done"
`;
}

export async function harnessInit(dir = '.', options = {}) {
  const targetDir = resolve(dir);
  const force = Boolean(options.force);

  console.log(chalk.bold('\nHarness state scaffold\n'));

  const spinner = ora('Scaffolding feature_list.json, progress.md, session-handoff.md, init.sh...').start();

  try {
    const templatesDir = getHarnessCreatorTemplatesDir();
    const packageManager = await detectPackageManager(targetDir, options.packageManager);
    const commands = options.commands
      ? options.commands.split(',').map((command) => command.trim()).filter(Boolean)
      : await detectVerificationCommands(targetDir, packageManager);

    await ensureDir(targetDir);
    const results = [];

    for (const [outputName, templateName] of Object.entries(STATE_FILES)) {
      const targetPath = join(targetDir, outputName);
      if (!force && (await pathExists(targetPath))) {
        results.push({ path: outputName, status: 'skipped', reason: 'exists' });
        continue;
      }
      const contents = await readFile(join(templatesDir, templateName), 'utf8');
      await writeFile(targetPath, contents, 'utf8');
      results.push({ path: outputName, status: 'written' });
    }

    const initPath = join(targetDir, 'init.sh');
    if (force || !(await pathExists(initPath))) {
      await writeFile(initPath, initScriptFromCommands(commands), 'utf8');
      await chmod(initPath, 0o755);
      results.push({ path: 'init.sh', status: 'written' });
    } else {
      results.push({ path: 'init.sh', status: 'skipped', reason: 'exists' });
    }

    spinner.succeed('Harness state scaffold complete');

    for (const result of results) {
      console.log(
        result.status === 'written'
          ? chalk.green(`  written  ${result.path}`)
          : chalk.dim(`  skipped  ${result.path} (${result.reason})`),
      );
    }

    console.log('');
    console.log(chalk.dim('Verification commands (see init.sh):'));
    for (const command of commands) {
      console.log(`  - ${command}`);
    }
    console.log('');

    return results;
  } catch (error) {
    spinner.fail('Harness state scaffold failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
