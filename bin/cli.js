#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .name('create-arsi-app')
  .description('Create a new React application with your preferred setup')
  .version('1.0.0')
  .argument('[project-name]', 'Name of your project')
  .action(async (projectName) => {
    console.log(chalk.blue.bold('\n🚀 Welcome to Create ARSI App!\n'));

    // Prompt for project name if not provided
    if (!projectName) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is your project name?',
          default: 'my-arsi-app',
          validate: (input) => {
            if (/^[a-z0-9-_]+$/i.test(input)) return true;
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          },
        },
      ]);
      projectName = name;
    }

    // Prompt for choices
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'routing',
        message: 'Which routing library would you like to use?',
        choices: [
          { name: 'React Router (with fs-routes)', value: 'react-router-fs' },
          { name: 'TanStack Router', value: 'tanstack-router' },
          { name: 'None', value: 'none' },
        ],
      },
      {
        type: 'list',
        name: 'ui',
        message: 'Which UI framework would you like to use?',
        choices: [
          { name: 'Tailwind CSS', value: 'tailwind' },
          { name: 'Tailwind CSS + shadcn/ui', value: 'tailwind-shadcn' },
          { name: 'Mantine', value: 'mantine' },
        ],
      },
      {
        type: 'list',
        name: 'state',
        message: 'Which state management library would you like to use?',
        choices: [
          { name: 'Zustand', value: 'zustand' },
          { name: 'Redux Toolkit', value: 'redux' },
          { name: 'None', value: 'none' },
        ],
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Would you like to use TypeScript?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'eslint',
        message: 'Would you like to include ESLint?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'husky',
        message: 'Would you like to include Husky for git hooks?',
        default: true,
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Which package manager would you like to use?',
        choices: [
          { name: 'pnpm', value: 'pnpm' },
          { name: 'npm', value: 'npm' },
          { name: 'yarn', value: 'yarn' },
        ],
        default: 'pnpm',
      },
    ]);

    const targetDir = path.resolve(process.cwd(), projectName);

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory ${projectName} already exists. Overwrite?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('\n❌ Operation cancelled.'));
        process.exit(0);
      }

      fs.removeSync(targetDir);
    }

    // Create project
    const spinner = ora('Creating project...').start();

    try {
      // Create target directory
      fs.ensureDirSync(targetDir);

      // Copy base template (always included)
      const templatesDir = path.resolve(__dirname, '../templates');
      const baseDir = path.join(templatesDir, 'base');

      if (fs.existsSync(baseDir)) {
        await copyTemplate(baseDir, targetDir);
      }

      // Copy routing template
      if (answers.routing !== 'none') {
        const routingDir = path.join(templatesDir, 'routing', answers.routing);
        if (fs.existsSync(routingDir)) {
          await mergeTemplate(routingDir, targetDir);
        }
      }

      // Copy UI template
      const uiDir = path.join(templatesDir, 'ui', answers.ui);
      if (fs.existsSync(uiDir)) {
        await mergeTemplate(uiDir, targetDir);
      }

      // Copy state management template
      if (answers.state !== 'none') {
        const stateDir = path.join(templatesDir, 'state', answers.state);
        if (fs.existsSync(stateDir)) {
          await mergeTemplate(stateDir, targetDir);
        }
      }

      // Merge package.json files
      await mergePackageJsons(targetDir, answers);

      // Update project name in package.json
      const pkgJsonPath = path.join(targetDir, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.name = projectName;
        pkgJson.version = '0.0.1';
        pkgJson.packageManager = `${answers.packageManager}@${await getPackageManagerVersion(answers.packageManager)}`;
        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
      }

      // Create .gitignore if it doesn't exist
      const gitignorePath = path.join(targetDir, '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        await fs.writeFile(gitignorePath, `node_modules
          dist
          build
          .env
          .env.local
          *.log
          .DS_Store
          `);
      }

      spinner.succeed(chalk.green('Project created successfully!'));

      // Install dependencies
      const installSpinner = ora('Installing dependencies...').start();

      try {
        await execa(answers.packageManager, ['install'], {
          cwd: targetDir,
          stdio: 'pipe',
        });
        installSpinner.succeed(chalk.green('Dependencies installed!'));
      } catch (error) {
        installSpinner.fail(chalk.red('Failed to install dependencies'));
        console.log(chalk.yellow('\nYou can install them manually by running:'));
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan(`  ${answers.packageManager} install`));
      }

      // Success message
      console.log(chalk.green.bold('\n✨ All done!\n'));
      console.log(chalk.cyan('To get started:'));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white(`  ${answers.packageManager} ${answers.packageManager === 'npm' ? 'run ' : ''}dev\n`));

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();

// Helper functions

async function copyTemplate(source, destination) {
  await fs.copy(source, destination, {
    filter: (src) => {
      // Skip node_modules and lock files
      const basename = path.basename(src);
      return !basename.includes('node_modules') &&
             !basename.includes('pnpm-lock.yaml') &&
             !basename.includes('package-lock.json') &&
             !basename.includes('yarn.lock');
    },
  });
}

async function mergeTemplate(source, destination) {
  const files = await fs.readdir(source, { withFileTypes: true });

  for (const file of files) {
    const sourcePath = path.join(source, file.name);
    const destPath = path.join(destination, file.name);

    // Skip node_modules and lock files
    if (file.name === 'node_modules' ||
        file.name === 'pnpm-lock.yaml' ||
        file.name === 'package-lock.json' ||
        file.name === 'yarn.lock') {
      continue;
    }

    // Skip package.json (handled separately)
    if (file.name === 'package.json') {
      continue;
    }

    if (file.isDirectory()) {
      await fs.ensureDir(destPath);
      await mergeTemplate(sourcePath, destPath);
    } else {
      // Copy file, overwriting if it exists
      await fs.copy(sourcePath, destPath, { overwrite: true });
    }
  }
}

async function mergePackageJsons(targetDir, answers) {
  const pkgJsonPath = path.join(targetDir, 'package.json');
  const templatesDir = path.resolve(__dirname, '../templates');

  let mergedPkg = {
    name: 'project',
    version: '0.0.1',
    scripts: {},
    dependencies: {},
    devDependencies: {},
  };

  // Merge base package.json
  const basePkgPath = path.join(templatesDir, 'base', 'package.json');
  if (fs.existsSync(basePkgPath)) {
    const basePkg = await fs.readJson(basePkgPath);
    mergedPkg = mergePkg(mergedPkg, basePkg);
  }

  // Merge routing package.json
  if (answers.routing !== 'none') {
    const routingPkgPath = path.join(templatesDir, 'routing', answers.routing, 'package.json');
    if (fs.existsSync(routingPkgPath)) {
      const routingPkg = await fs.readJson(routingPkgPath);
      mergedPkg = mergePkg(mergedPkg, routingPkg);
    }
  }

  // Merge UI package.json
  const uiPkgPath = path.join(templatesDir, 'ui', answers.ui, 'package.json');
  if (fs.existsSync(uiPkgPath)) {
    const uiPkg = await fs.readJson(uiPkgPath);
    mergedPkg = mergePkg(mergedPkg, uiPkg);
  }

  // Merge state package.json
  if (answers.state !== 'none') {
    const statePkgPath = path.join(templatesDir, 'state', answers.state, 'package.json');
    if (fs.existsSync(statePkgPath)) {
      const statePkg = await fs.readJson(statePkgPath);
      mergedPkg = mergePkg(mergedPkg, statePkg);
    }
  }

  await fs.writeJson(pkgJsonPath, mergedPkg, { spaces: 2 });
}

function mergePkg(target, source) {
  return {
    ...target,
    ...source,
    scripts: { ...target.scripts, ...source.scripts },
    dependencies: { ...target.dependencies, ...source.dependencies },
    devDependencies: { ...target.devDependencies, ...source.devDependencies },
  };
}

async function getPackageManagerVersion(packageManager) {
  try {
    const { stdout } = await execa(packageManager, ['--version']);
    return stdout.trim();
  } catch {
    // Return default versions if detection fails
    const defaults = {
      pnpm: '10.11.1',
      npm: '10.0.0',
      yarn: '4.0.0',
    };
    return defaults[packageManager] || '1.0.0';
  }
}
