#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import { addTailwindToViteConfig } from './vite-config-modifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// Template configurations
const ROUTING_OPTIONS = [
  {
    name: 'React Router, React Query & Graphql',
    value: 'rr-graphql-rq',
    description: 'React Router with react query and GraphQL support',
    isReactRouterFramework: true
  },
  {
    name: 'React Router with File-System Routes, React Query & GraphQL',
    value: 'rr-fs-graphql-rq',
    description: 'React Router with file-system routing, react query and GraphQL support',
    isReactRouterFramework: true
  },
  {
    name: 'Basic SPA with react router, react query and GraphQL support',
    value: 'basic-spa',
    description: 'Basic SPA app with React Router, react query and GraphQL support',
    isReactRouterFramework: false
  },
];

const RENDER_MODE_OPTIONS = [
  {
    name: 'SSR (Server-Side Rendering)',
    value: 'ssr',
    description: 'Server-side rendering for better SEO and initial load performance'
  },
  {
    name: 'SPA (Single Page Application)',
    value: 'spa',
    description: 'Client-side only rendering'
  }
];

const UI_OPTIONS = [
  {
    name: 'Shadcn UI + Tailwind CSS',
    value: 'shadcn-tailwind',
    description: 'Shadcn UI components with Tailwind CSS'
  },
  {
    name: 'Tailwind CSS (Basic)',
    value: 'tailwind',
    description: 'Tailwind CSS with basic utilities'
  },
];

// Helper function to merge package.json files
function mergePackageJson(base, ...sources) {
  const merged = { ...base };

  for (const source of sources) {
    // Merge dependencies
    if (source.dependencies) {
      merged.dependencies = { ...merged.dependencies, ...source.dependencies };
    }

    // Merge devDependencies
    if (source.devDependencies) {
      merged.devDependencies = { ...merged.devDependencies, ...source.devDependencies };
    }

    // Merge scripts
    if (source.scripts) {
      merged.scripts = { ...merged.scripts, ...source.scripts };
    }

    // Merge other fields (prefer source over base)
    for (const key of Object.keys(source)) {
      if (!['dependencies', 'devDependencies', 'scripts', 'name', 'version'].includes(key)) {
        merged[key] = source[key];
      }
    }
  }

  return merged;
}

// Helper function to copy directory recursively, excluding node_modules
async function copyTemplate(src, dest, exclude = ['node_modules', 'pnpm-lock.yaml']) {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (exclude.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath, exclude);
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}

// Helper function to merge directories
async function mergeDirectories(src, dest, exclude = ['node_modules', 'pnpm-lock.yaml', 'package.json'], overwriteFiles = []) {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (exclude.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      await mergeDirectories(srcPath, destPath, exclude, overwriteFiles);
    } else {
      // Check if this file should always be overwritten
      const shouldOverwrite = overwriteFiles.some(pattern => {
        if (typeof pattern === 'string') {
          return destPath.endsWith(pattern);
        }
        return pattern.test(destPath);
      });

      // Copy if file doesn't exist OR if it should be overwritten
      if (!await fs.pathExists(destPath) || shouldOverwrite) {
        await fs.copy(srcPath, destPath);
      }
    }
  }
}

// Helper function to initialize git repository
async function initializeGit(targetDir, projectName) {
  const gitSpinner = ora('Initializing git repository...').start();

  try {
    // Check if git is installed
    try {
      await execa('git', ['--version'], { cwd: targetDir });
    } catch (error) {
      gitSpinner.warn(chalk.yellow('Git is not installed. Skipping git initialization.'));
      return;
    }

    // Initialize git repository
    await execa('git', ['init'], { cwd: targetDir });

    // Create and checkout dev branch
    await execa('git', ['checkout', '-b', 'dev'], { cwd: targetDir });

    // Stage all files
    await execa('git', ['add', '.'], { cwd: targetDir });

    // Create initial commit
    await execa('git', ['commit', '-m', 'Initial commit: Project scaffolded'], { cwd: targetDir });

    gitSpinner.succeed(chalk.green('Git repository initialized with "dev" branch!'));
  } catch (error) {
    gitSpinner.fail(chalk.red('Failed to initialize git repository'));
    console.log(chalk.yellow('\nYou can initialize git manually by running:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  git init'));
    console.log(chalk.cyan('  git checkout -b dev'));
    console.log(chalk.cyan('  git add .'));
    console.log(chalk.cyan('  git commit -m "Initial commit"'));
  }
}

// Main CLI function
async function createProject(projectName, options) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const templatesDir = path.resolve(__dirname, '..', 'templates');

  // Check if directory already exists
  if (await fs.pathExists(targetDir)) {
    console.log(chalk.red(`\n❌ Directory "${projectName}" already exists!`));
    process.exit(1);
  }

  console.log(chalk.cyan('\n🚀 Welcome to Create Arsi Frontend!\n'));

  // Prompt for routing option
  const { routing } = await inquirer.prompt([
    {
      type: 'list',
      name: 'routing',
      message: 'Which routing setup would you like to use?',
      choices: ROUTING_OPTIONS.map(opt => ({
        name: `${opt.name} - ${chalk.gray(opt.description)}`,
        value: opt.value
      }))
    }
  ]);

  // Check if selected routing is React Router framework mode
  const selectedRoutingOption = ROUTING_OPTIONS.find(opt => opt.value === routing);
  let renderMode = null;

  // Prompt for render mode if using React Router framework
  if (selectedRoutingOption?.isReactRouterFramework) {
    const renderModeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'renderMode',
        message: 'Which rendering mode would you like to use?',
        choices: RENDER_MODE_OPTIONS.map(opt => ({
          name: `${opt.name} - ${chalk.gray(opt.description)}`,
          value: opt.value
        }))
      }
    ]);
    renderMode = renderModeAnswer.renderMode;
  }

  // Prompt for UI option
  const { ui } = await inquirer.prompt([
    {
      type: 'list',
      name: 'ui',
      message: 'Which UI framework would you like to use?',
      choices: UI_OPTIONS.map(opt => ({
        name: `${opt.name} - ${chalk.gray(opt.description)}`,
        value: opt.value
      }))
    }
  ]);

  // Confirm package manager
  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: ['pnpm', 'npm', 'yarn'],
      default: 'pnpm'
    }
  ]);

  // Prompt for git initialization (unless --skip-git flag is used)
  let initGit = !options.skipGit;
  if (!options.skipGit) {
    const gitAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'initGit',
        message: 'Initialize a git repository with "dev" branch?',
        default: true
      }
    ]);
    initGit = gitAnswer.initGit;
  }

  const spinner = ora('Creating your project...').start();

  try {
    // Create target directory
    await fs.ensureDir(targetDir);

    // Step 1: Copy base template
    spinner.text = 'Copying base template...';
    const baseDir = path.join(templatesDir, 'base');
    await copyTemplate(baseDir, targetDir);

    // Step 2: Copy routing template
    spinner.text = `Setting up ${routing} routing...`;
    const routingDir = path.join(templatesDir, 'features', 'routing', routing);
    await mergeDirectories(routingDir, targetDir);

    // Step 3: Copy UI template (overwrite app.css to ensure UI styles are applied)
    spinner.text = `Setting up ${ui} UI framework...`;
    const uiDir = path.join(templatesDir, 'features', 'ui', ui);
    await mergeDirectories(uiDir, targetDir, ['node_modules', 'pnpm-lock.yaml', 'package.json'], ['app.css']);

    // Step 3.5: Modify vite.config.ts if using Tailwind-based UI
    if (ui === 'tailwind' || ui === 'shadcn-tailwind') {
      spinner.text = 'Configuring Tailwind CSS in Vite...';
      const viteConfigPath = path.join(targetDir, 'vite.config.ts');

      try {
        await addTailwindToViteConfig(viteConfigPath);
      } catch (error) {
        spinner.warn(chalk.yellow(`Warning: ${error.message}`));
        console.log(chalk.yellow('You may need to manually add Tailwind CSS to your vite.config.ts'));
      }
    }

    // Step 4: Create react-router.config.ts if using React Router framework
    if (renderMode) {
      spinner.text = 'Creating React Router configuration...';
      const reactRouterConfig = `import type { Config } from '@react-router/dev/config'

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to \`false\`
  ssr: ${renderMode === 'ssr'},
} satisfies Config
`;
      await fs.writeFile(
        path.join(targetDir, 'react-router.config.ts'),
        reactRouterConfig,
        'utf-8'
      );
    }

    // Step 5: Merge package.json files
    spinner.text = 'Merging package configurations...';
    const basePackageJson = await fs.readJson(path.join(baseDir, 'package.json'));
    const routingPackageJson = await fs.readJson(path.join(routingDir, 'package.json'));
    const uiPackageJson = await fs.readJson(path.join(uiDir, 'package.json'));

    const mergedPackageJson = mergePackageJson(
      basePackageJson,
      routingPackageJson,
      uiPackageJson
    );

    // Update project name
    mergedPackageJson.name = projectName;
    mergedPackageJson.version = '0.0.1';

    // Write merged package.json
    await fs.writeJson(
      path.join(targetDir, 'package.json'),
      mergedPackageJson,
      { spaces: 2 }
    );

    spinner.succeed(chalk.green('Project created successfully!'));

    // Install dependencies
    if (!options.skipInstall) {
      const installSpinner = ora('Installing dependencies...').start();

      try {
        await execa(packageManager, ['install'], {
          cwd: targetDir,
          stdio: 'inherit'
        });
        installSpinner.succeed(chalk.green('Dependencies installed successfully!'));
      } catch (error) {
        installSpinner.fail(chalk.red('Failed to install dependencies'));
        console.log(chalk.yellow('\nYou can install them manually by running:'));
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan(`  ${packageManager} install`));
      }
    }

    // Initialize git repository if requested
    if (initGit) {
      await initializeGit(targetDir, projectName);
    }

    // Initialize Husky after git (Husky requires git to be initialized first)
    if (!options.skipInstall && initGit) {
      const huskySpinner = ora('Initializing Husky...').start();
      try {
        const huskyInitCmd = packageManager === 'pnpm'
          ? ['exec', 'husky', 'init']
          : packageManager === 'yarn'
          ? ['dlx', 'husky', 'init']
          : packageManager === 'bun'
          ? ['x', 'husky', 'init']
          : ['exec', '--', 'husky', 'init']; // npm default

        await execa(packageManager === 'npm' ? 'npx' : packageManager, huskyInitCmd, {
          cwd: targetDir,
          stdio: 'pipe'
        });

        // Update pre-commit hook to use lint-staged instead of npm test
        const preCommitPath = path.join(targetDir, '.husky', 'pre-commit');
        const lintStagedCmd = packageManager === 'npm'
          ? 'npx lint-staged'
          : `${packageManager} lint-staged`;

        const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${lintStagedCmd}
`;

        await fs.writeFile(preCommitPath, preCommitContent, 'utf-8');

        huskySpinner.succeed(chalk.green('Husky initialized successfully!'));
      } catch (error) {
        huskySpinner.warn(chalk.yellow('Husky initialization skipped or failed'));
        console.log(chalk.gray('You can initialize Husky manually by running:'));
        console.log(chalk.cyan(`  cd ${projectName}`));
        if (packageManager === 'pnpm') {
          console.log(chalk.cyan(`  pnpm exec husky init`));
        } else if (packageManager === 'yarn') {
          console.log(chalk.cyan(`  yarn dlx husky init`));
        } else if (packageManager === 'bun') {
          console.log(chalk.cyan(`  bunx husky init`));
        } else {
          console.log(chalk.cyan(`  npx husky init`));
        }
      }
    }

    // Success message
    console.log(chalk.green('\n✨ All done! Your project is ready.\n'));
    console.log(chalk.cyan('To get started:\n'));
    console.log(chalk.white(`  cd ${projectName}`));

    if (options.skipInstall) {
      console.log(chalk.white(`  ${packageManager} install`));
    }

    console.log(chalk.white(`  ${packageManager} run dev`));
    console.log(chalk.cyan('\nHappy coding! 🎉\n'));

  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    console.error(chalk.red('\nError:'), error.message);

    // Cleanup on failure
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
    }

    process.exit(1);
  }
}

// CLI setup
program
  .name('create-arsi-app')
  .description('Create a new React application with Arsi Frontend Starter')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-git', 'Skip git repository initialization')
  .action(async (projectName, options) => {
    let name = projectName;

    // If no project name provided, prompt for it
    if (!name) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-arsi-app',
          validate: (input) => {
            if (!input || input.trim() === '') {
              return 'Project name is required';
            }
            if (!/^[a-z0-9-_]+$/i.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores';
            }
            return true;
          }
        }
      ]);
      name = answers.projectName;
    }

    await createProject(name, options);
  });

program.parse();
