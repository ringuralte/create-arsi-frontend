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
    console.log(chalk.blue.bold('\n🚀 Welcome to Create Arsi Frontend!\n'));

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

    // Get available templates
    const templatesDir = path.resolve(__dirname, '../templates');
    const availableTemplates = await getAvailableTemplates(templatesDir);

    if (availableTemplates.length === 0) {
      console.log(chalk.red('\n❌ No templates found in the templates directory.'));
      process.exit(1);
    }

    // Prompt for template selection and other options
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: availableTemplates.map(t => ({
          name: formatTemplateName(t),
          value: t,
        })),
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Use TypeScript?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'eslint',
        message: 'Include ESLint?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'husky',
        message: 'Include Husky for git hooks?',
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

    // Prompt for environment variables if template needs them
    let envVars = {};
    if (needsEnvConfiguration(answers.template)) {
      console.log(chalk.cyan('\n⚙️  Environment Configuration\n'));
      envVars = await promptForEnvVars(answers.template);
    }

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

      // Copy base template first (if it exists)
      const baseDir = path.join(templatesDir, 'base');
      if (fs.existsSync(baseDir)) {
        await copyTemplate(baseDir, targetDir, answers);
        spinner.text = 'Base template copied...';
      }

      // Copy selected template
      const templateDir = path.join(templatesDir, answers.template);
      if (fs.existsSync(templateDir)) {
        await copyTemplate(templateDir, targetDir, answers, true);
        spinner.text = 'Template files copied...';
      }

      // Merge package.json files
      await mergePackageJsons(targetDir, templatesDir, answers);

      // Update project name and package manager in package.json
      const pkgJsonPath = path.join(targetDir, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.name = projectName;
        pkgJson.version = '0.1.0';

        const pmVersion = await getPackageManagerVersion(answers.packageManager);
        pkgJson.packageManager = `${answers.packageManager}@${pmVersion}`;

        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
      }

      // Remove TypeScript files if TypeScript is not selected
      if (!answers.typescript) {
        await removeTypeScriptFiles(targetDir);
        await convertToJavaScript(targetDir);
      }

      // Remove ESLint files if not selected
      if (!answers.eslint) {
        await removeESLintFiles(targetDir);
      }

      // Remove Husky files if not selected
      if (!answers.husky) {
        await removeHuskyFiles(targetDir);
      }

      // Create/update .gitignore
      await createGitignore(targetDir);

      // Create .env.development file with user-provided values
      if (envVars && Object.keys(envVars).length > 0) {
        await createEnvFile(targetDir, envVars);
        spinner.text = 'Environment file created...';
      }

      // Initialize git repository
      try {
        await execa('git', ['init', '-b', 'dev'], { cwd: targetDir });
        spinner.text = 'Git repository initialized...';
      } catch (error) {
        // Git init is optional, don't fail if it doesn't work
      }

      spinner.succeed(chalk.green('Project created successfully!'));

      // Install dependencies
      const installSpinner = ora('Installing dependencies...').start();

      try {
        const installArgs = answers.packageManager === 'yarn' ? [] : ['install'];
        await execa(answers.packageManager, installArgs, {
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

      // Setup Husky if selected and installed
      if (answers.husky) {
        const huskySpinner = ora('Setting up Husky...').start();
        try {
          const prepareArgs = answers.packageManager === 'npm' ? ['run', 'prepare'] : ['prepare'];
          await execa(answers.packageManager, prepareArgs, {
            cwd: targetDir,
            stdio: 'pipe',
          });
          huskySpinner.succeed(chalk.green('Husky configured!'));
        } catch (error) {
          huskySpinner.warn(chalk.yellow('Husky setup skipped'));
        }
      }

      // Success message
      console.log(chalk.green.bold('\n✨ All done!\n'));
      console.log(chalk.cyan('Your project is ready. To get started:\n'));
      console.log(chalk.white(`  cd ${projectName}`));

      const devCommand = answers.packageManager === 'npm' ? 'npm run dev' : `${answers.packageManager} dev`;
      console.log(chalk.white(`  ${devCommand}\n`));

      // Show template-specific instructions if any
      showTemplateInstructions(answers.template);

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(chalk.red('\nError details:'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();

// Helper functions

async function getAvailableTemplates(templatesDir) {
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  const entries = await fs.readdir(templatesDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory() && entry.name !== 'base')
    .map(entry => entry.name);
}

function formatTemplateName(templateName) {
  // Convert kebab-case to Title Case with proper formatting
  return templateName
    .split('-')
    .map(word => {
      // Keep acronyms uppercase
      if (word === 'ssr') return 'SSR';
      if (word === 'fs') return 'FS';
      if (word === 'ui') return 'UI';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

async function copyTemplate(source, destination, answers, overwrite = false) {
  await fs.copy(source, destination, {
    overwrite,
    filter: (src) => {
      const basename = path.basename(src);

      // Always skip node_modules and lock files
      if (basename === 'node_modules') return false;
      if (basename === 'pnpm-lock.yaml') return false;
      if (basename === 'package-lock.json') return false;
      if (basename === 'yarn.lock') return false;

      // Skip package.json (handled separately)
      if (basename === 'package.json') return false;

      // Skip .env files (handled separately)
      if (basename === '.env.development') return false;
      if (basename === '.env.example') return false;
      if (basename === '.env') return false;

      // Skip TypeScript config if TypeScript not selected
      if (!answers.typescript) {
        if (basename === 'tsconfig.json') return false;
        if (basename.endsWith('.d.ts')) return false;
      }

      // Skip ESLint config if not selected
      if (!answers.eslint) {
        if (basename === 'eslint.config.js') return false;
        if (basename === '.eslintrc.json') return false;
        if (basename === '.eslintrc.js') return false;
        if (basename === '.eslintignore') return false;
      }

      // Skip Husky and related files if not selected
      if (!answers.husky) {
        if (basename === '.husky') return false;
        if (basename === 'commitlint.config.js') return false;
      }

      return true;
    },
  });
}

async function mergePackageJsons(targetDir, templatesDir, answers) {
  let mergedPkg = {
    name: 'project',
    version: '0.1.0',
    type: 'module',
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

  // Merge template package.json
  const templatePkgPath = path.join(templatesDir, answers.template, 'package.json');
  if (fs.existsSync(templatePkgPath)) {
    const templatePkg = await fs.readJson(templatePkgPath);
    mergedPkg = mergePkg(mergedPkg, templatePkg);
  }

  // Remove ESLint dependencies if not selected
  if (!answers.eslint && mergedPkg.devDependencies) {
    Object.keys(mergedPkg.devDependencies).forEach(dep => {
      if (dep.includes('eslint')) {
        delete mergedPkg.devDependencies[dep];
      }
    });

    // Remove lint scripts
    if (mergedPkg.scripts) {
      delete mergedPkg.scripts.lint;
      delete mergedPkg.scripts['lint:fix'];
      delete mergedPkg.scripts.format;
    }

    // Remove lint-staged config
    delete mergedPkg['lint-staged'];
  }

  // Remove Husky dependencies if not selected
  if (!answers.husky && mergedPkg.devDependencies) {
    delete mergedPkg.devDependencies.husky;
    delete mergedPkg.devDependencies['lint-staged'];
    delete mergedPkg.devDependencies['@commitlint/cli'];
    delete mergedPkg.devDependencies['@commitlint/config-conventional'];

    // Remove husky scripts
    if (mergedPkg.scripts) {
      delete mergedPkg.scripts.prepare;
    }

    // Remove lint-staged config
    delete mergedPkg['lint-staged'];
  }

  // Remove TypeScript dependencies if not selected
  if (!answers.typescript && mergedPkg.devDependencies) {
    Object.keys(mergedPkg.devDependencies).forEach(dep => {
      if (dep.includes('typescript') || dep.includes('@types/')) {
        delete mergedPkg.devDependencies[dep];
      }
    });

    // Remove typecheck script
    if (mergedPkg.scripts) {
      delete mergedPkg.scripts.typecheck;
    }
  }

  await fs.writeJson(path.join(targetDir, 'package.json'), mergedPkg, { spaces: 2 });
}

function mergePkg(target, source) {
  const result = { ...target };

  // Merge top-level properties
  Object.keys(source).forEach(key => {
    if (key === 'scripts' || key === 'dependencies' || key === 'devDependencies') {
      result[key] = { ...target[key], ...source[key] };
    } else if (key !== 'name' && key !== 'version') {
      result[key] = source[key];
    }
  });

  return result;
}

async function removeTypeScriptFiles(targetDir) {
  const files = await getAllFiles(targetDir);

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // We'll convert these, not remove them
      continue;
    }
    if (file.endsWith('.d.ts') || path.basename(file) === 'tsconfig.json') {
      await fs.remove(file);
    }
  }
}

async function convertToJavaScript(targetDir) {
  const files = await getAllFiles(targetDir);

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = await fs.readFile(file, 'utf-8');

      // Basic TypeScript to JavaScript conversion
      // Remove type annotations and interfaces
      content = content.replace(/:\s*\w+(\[\])?(\s*=|\s*\)|\s*,|\s*;|\s*\|)/g, '$1');
      content = content.replace(/interface\s+\w+\s*{[^}]*}/g, '');
      content = content.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
      content = content.replace(/<[^>]+>/g, ''); // Remove generic types
      content = content.replace(/as\s+\w+/g, '');
      content = content.replace(/import\s+type\s+/g, 'import ');

      // Determine new extension
      const newFile = file.endsWith('.tsx')
        ? file.replace(/\.tsx$/, '.jsx')
        : file.replace(/\.ts$/, '.js');

      await fs.writeFile(newFile, content);

      if (newFile !== file) {
        await fs.remove(file);
      }
    }
  }
}

async function removeESLintFiles(targetDir) {
  const filesToRemove = [
    'eslint.config.js',
    '.eslintrc.json',
    '.eslintrc.js',
    '.eslintignore',
  ];

  for (const file of filesToRemove) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      await fs.remove(filePath);
    }
  }
}

async function removeHuskyFiles(targetDir) {
  const huskyDir = path.join(targetDir, '.husky');
  const commitlintConfig = path.join(targetDir, 'commitlint.config.js');

  if (fs.existsSync(huskyDir)) {
    await fs.remove(huskyDir);
  }

  if (fs.existsSync(commitlintConfig)) {
    await fs.remove(commitlintConfig);
  }
}

async function getAllFiles(dir) {
  const files = [];

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories (except .husky)
        if (entry.name === 'node_modules' || (entry.name.startsWith('.') && entry.name !== '.husky')) {
          continue;
        }
        await walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function createGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');

  const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov
.nyc_output

# Production builds
dist/
build/
.output/
.vercel/
.netlify/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.history/

# OS files
Thumbs.db

# Temporary files
*.tmp
*.temp
.cache/

# React Router specific
.react-router/

# TanStack specific
.tanstack/

# Vite
.vite/
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

# TypeScript
*.tsbuildinfo
`;

  await fs.writeFile(gitignorePath, gitignoreContent);
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

function showTemplateInstructions(templateName) {
  if (templateName === 'ssr-fs-shadcn-graphql') {
    console.log(chalk.blue('📝 Template-specific notes:'));
    console.log(chalk.white('  • This template uses React Router with SSR'));
    console.log(chalk.white('  • shadcn/ui components are pre-configured'));
    console.log(chalk.white('  • GraphQL client is set up with TanStack Query'));
    console.log(chalk.white('  • Update the GraphQL schema in codegen.ts'));
    console.log(chalk.white('  • Environment variables are configured in .env.development\n'));
  }
}

function needsEnvConfiguration(templateName) {
  // Add template names that require environment configuration
  const templatesWithEnv = ['ssr-fs-shadcn-graphql'];
  return templatesWithEnv.includes(templateName);
}

async function promptForEnvVars(templateName) {
  if (templateName === 'ssr-fs-shadcn-graphql') {
    const envAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Backend API base URL:',
        default: 'http://localhost:8002',
        validate: (input) => {
          if (!input.trim()) return 'Base URL is required';
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        },
      },
      {
        type: 'input',
        name: 'graphqlUrl',
        message: 'GraphQL endpoint URL:',
        default: (answers) => `${answers.baseUrl}/arsi`,
        validate: (input) => {
          if (!input.trim()) return 'GraphQL URL is required';
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        },
      },
      {
        type: 'input',
        name: 'sessionCookieName',
        message: 'Session cookie name:',
        default: 'arsi-project',
        validate: (input) => {
          if (!input.trim()) return 'Cookie name is required';
          if (!/^[a-z0-9-_]+$/i.test(input)) {
            return 'Cookie name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'password',
        name: 'sessionSecret',
        message: 'Session secret (leave empty to generate random):',
        default: '',
        mask: '*',
      },
      {
        type: 'input',
        name: 'rzpayKey',
        message: 'Razorpay key (optional):',
        default: '',
      },
    ]);

    // Generate random session secret if not provided
    if (!envAnswers.sessionSecret) {
      envAnswers.sessionSecret = generateRandomSecret(32);
    }

    return {
      VITE_BASE_URL: envAnswers.baseUrl,
      VITE_BASE_GRAPHQL_URL: envAnswers.graphqlUrl,
      VITE_SESSION_COOKIE_NAME: envAnswers.sessionCookieName,
      VITE_SESSION_SECRET: envAnswers.sessionSecret,
      VITE_RZPAY_KEY: envAnswers.rzpayKey,
    };
  }

  return {};
}

async function createEnvFile(targetDir, envVars) {
  const envDevPath = path.join(targetDir, '.env.development');
  const envExamplePath = path.join(targetDir, '.env.example');

  let envContent = '# Environment Configuration\n';
  envContent += '# Generated by create-arsi-app\n\n';

  for (const [key, value] of Object.entries(envVars)) {
    envContent += `${key}=${value}\n`;
  }

  // Create .env.development with actual values
  await fs.writeFile(envDevPath, envContent);

  // Create .env.example with placeholder values
  let exampleContent = '# Environment Configuration\n';
  exampleContent += '# Copy this file to .env.development and fill in your values\n\n';

  for (const [key, value] of Object.entries(envVars)) {
    // Use placeholder values for example file
    let exampleValue = value;
    if (key === 'VITE_SESSION_SECRET') {
      exampleValue = 'your-secret-key-here';
    } else if (key === 'VITE_RZPAY_KEY' && !value) {
      exampleValue = '';
    } else if (key.includes('URL')) {
      // Keep URL examples as-is
      exampleValue = value;
    } else if (key === 'VITE_SESSION_COOKIE_NAME') {
      exampleValue = value;
    }

    exampleContent += `${key}=${exampleValue}\n`;
  }

  // Create .env.example
  await fs.writeFile(envExamplePath, exampleContent);
}

function generateRandomSecret(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}
