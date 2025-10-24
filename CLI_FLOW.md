# CLI Flow Diagram

This document visualizes how the Create ARSI App CLI works from start to finish.

## High-Level Flow

```
User runs CLI
    ↓
Parse arguments & show welcome
    ↓
Prompt for project name (if not provided)
    ↓
Detect available templates
    ↓
Interactive prompts (template, TypeScript, ESLint, Husky, package manager)
    ↓
Check if directory exists → Ask to overwrite if yes
    ↓
Create project directory
    ↓
Copy base template
    ↓
Copy selected template (merge/overwrite)
    ↓
Merge package.json files
    ↓
Apply user preferences (remove TS, ESLint, Husky if disabled)
    ↓
Create/update .gitignore
    ↓
Initialize git repository
    ↓
Install dependencies
    ↓
Setup Husky (if enabled)
    ↓
Show success message & next steps
```

## Detailed Flow

### 1. Initialization Phase

```
node bin/cli.js [project-name]
    ↓
Import dependencies (chalk, inquirer, ora, etc.)
    ↓
Setup commander program
    ↓
Display: 🚀 Welcome to Create ARSI App!
```

### 2. Input Collection Phase

```
If project-name not provided:
    ↓
    Prompt: "What is your project name?"
    ↓
    Validate: alphanumeric, hyphens, underscores only
    ↓
    Store as projectName

Scan templates/ directory:
    ↓
    getAvailableTemplates(templatesDir)
    ↓
    Filter out 'base' directory
    ↓
    Filter only directories
    ↓
    If no templates found → ERROR & EXIT

Interactive Prompts:
    ↓
    1. Template selection
       ├─ Display formatted template names
       └─ Store as answers.template
    ↓
    2. TypeScript? (default: true)
       └─ Store as answers.typescript
    ↓
    3. ESLint? (default: true)
       └─ Store as answers.eslint
    ↓
    4. Husky? (default: true)
       └─ Store as answers.husky
    ↓
    5. Package Manager? (pnpm/npm/yarn)
       └─ Store as answers.packageManager
```

### 3. Directory Check Phase

```
targetDir = path.resolve(process.cwd(), projectName)
    ↓
Does directory exist?
    ├─ YES → Prompt: "Directory exists. Overwrite?"
    │   ├─ YES → fs.removeSync(targetDir)
    │   └─ NO → Display "Operation cancelled" & EXIT
    └─ NO → Continue
```

### 4. File Copying Phase

```
Start spinner: "Creating project..."
    ↓
Create target directory: fs.ensureDirSync(targetDir)
    ↓
Copy Base Template:
    ↓
    Source: templates/base/
    ↓
    Filter files:
    ├─ Skip: node_modules, lock files, package.json
    ├─ Skip tsconfig.json if !typescript
    ├─ Skip eslint configs if !eslint
    └─ Skip .husky if !husky
    ↓
    copyTemplate(baseDir, targetDir, answers)
    ↓
    Update spinner: "Base template copied..."

Copy Selected Template:
    ↓
    Source: templates/{answers.template}/
    ↓
    Apply same filtering
    ↓
    copyTemplate(templateDir, targetDir, answers, overwrite=true)
    ↓
    Update spinner: "Template files copied..."
```

### 5. Package.json Merging Phase

```
Initialize merged package.json:
    {
      name: 'project',
      version: '0.1.0',
      type: 'module',
      scripts: {},
      dependencies: {},
      devDependencies: {}
    }
    ↓
Read base/package.json → Merge
    ↓
Read {template}/package.json → Merge
    ↓
Apply filters based on answers:
    ├─ !eslint → Remove eslint dependencies & scripts
    ├─ !husky → Remove husky, lint-staged, commitlint
    └─ !typescript → Remove TS dependencies & typecheck script
    ↓
Update:
    ├─ name → projectName
    ├─ version → 0.1.0
    └─ packageManager → {manager}@{version}
    ↓
Write to targetDir/package.json
```

### 6. Cleanup Phase

```
If !typescript:
    ↓
    Find all .ts and .tsx files
    ↓
    Convert to .js/.jsx:
    ├─ Remove type annotations
    ├─ Remove interfaces
    ├─ Remove generic types
    ├─ Remove 'import type'
    └─ Remove 'as Type' assertions
    ↓
    Delete tsconfig.json and .d.ts files

If !eslint:
    ↓
    Delete eslint.config.js, .eslintrc.*, .eslintignore

If !husky:
    ↓
    Delete .husky/ directory
    ↓
    Delete commitlint.config.js
```

### 7. Git Initialization Phase

```
Create/Update .gitignore:
    ↓
    Write standard .gitignore content
    ↓
Initialize git:
    ↓
    Run: git init
    ↓
    Update spinner: "Git repository initialized..."
    ↓
    (Continues even if git init fails)
```

### 8. Dependency Installation Phase

```
Spinner succeed: "Project created successfully!"
    ↓
Start new spinner: "Installing dependencies..."
    ↓
Determine install command:
    ├─ pnpm → ['install']
    ├─ npm → ['install']
    └─ yarn → []
    ↓
Run: execa(packageManager, installArgs, { cwd: targetDir })
    ↓
SUCCESS:
    └─ Spinner succeed: "Dependencies installed!"
    ↓
FAILURE:
    ├─ Spinner fail: "Failed to install dependencies"
    └─ Show manual install instructions
```

### 9. Husky Setup Phase

```
If answers.husky:
    ↓
    Start spinner: "Setting up Husky..."
    ↓
    Determine command:
    ├─ npm → ['run', 'prepare']
    └─ pnpm/yarn → ['prepare']
    ↓
    Run: execa(packageManager, prepareArgs, { cwd: targetDir })
    ↓
    SUCCESS:
        └─ Spinner succeed: "Husky configured!"
    ↓
    FAILURE:
        └─ Spinner warn: "Husky setup skipped"
```

### 10. Success Phase

```
Display:
    ✨ All done!

    Your project is ready. To get started:

      cd {projectName}
      {packageManager} dev

Show template-specific instructions:
    ↓
    if template === 'ssr-fs-shadcn-graphql':
        Display GraphQL setup notes
```

## File Filtering Logic

```
For each file in template:
    ↓
    basename = path.basename(file)
    ↓
    Always skip:
    ├─ node_modules/
    ├─ pnpm-lock.yaml
    ├─ package-lock.json
    ├─ yarn.lock
    └─ package.json (handled separately)
    ↓
    If !typescript, skip:
    ├─ tsconfig.json
    └─ *.d.ts
    ↓
    If !eslint, skip:
    ├─ eslint.config.js
    ├─ .eslintrc.*
    └─ .eslintignore
    ↓
    If !husky, skip:
    ├─ .husky/
    └─ commitlint.config.js
    ↓
    Otherwise: COPY
```

## Package.json Merging Logic

```
mergePkg(target, source):
    ↓
    result = { ...target }
    ↓
    For each key in source:
        ├─ If key === 'scripts': Merge objects
        ├─ If key === 'dependencies': Merge objects
        ├─ If key === 'devDependencies': Merge objects
        ├─ If key === 'name' or 'version': Skip (keep target)
        └─ Else: Overwrite with source value
    ↓
    Return result
```

## Error Handling

```
Try-Catch around main process:
    ↓
    Try:
        └─ Execute all steps
    ↓
    Catch:
        ├─ Spinner fail: "Failed to create project"
        ├─ Display error details
        └─ process.exit(1)

Graceful handling:
    ├─ No templates found → Error message & exit
    ├─ User cancels overwrite → "Operation cancelled" & exit
    ├─ Git init fails → Continue (optional step)
    ├─ Install fails → Show manual instructions
    └─ Husky setup fails → Warn and continue
```

## Template Detection

```
getAvailableTemplates(templatesDir):
    ↓
    Check if templates/ exists
    ├─ NO → Return []
    └─ YES → Continue
    ↓
    Read directory with file types
    ↓
    Filter:
    ├─ Only directories
    ├─ Exclude 'base'
    └─ Return array of names
    ↓
Example: ['ssr-fs-shadcn-graphql', 'future-template']
```

## Template Name Formatting

```
formatTemplateName('ssr-fs-shadcn-graphql'):
    ↓
    Split by '-': ['ssr', 'fs', 'shadcn', 'graphql']
    ↓
    Map each word:
    ├─ 'ssr' → 'SSR'
    ├─ 'fs' → 'FS'
    ├─ 'ui' → 'UI'
    └─ other → Capitalize first letter
    ↓
    Join with spaces: 'SSR FS Shadcn GraphQL'
```

## Command Line Arguments

```
create-arsi-app [project-name]
    ↓
    [project-name] is optional
    ↓
    If provided:
        └─ Use as projectName
    ↓
    If not provided:
        └─ Prompt user for name
```

## Success Criteria

All of the following must be true:

✅ Project directory created
✅ Base template files copied
✅ Selected template files copied
✅ package.json properly merged and configured
✅ Unwanted files removed based on selections
✅ .gitignore created
✅ Git repository initialized (optional)
✅ Dependencies installed
✅ Husky configured (if enabled)
✅ Success message displayed

## Exit Points

The CLI can exit at these points:

1. ❌ No templates found
2. ❌ User declines to overwrite existing directory
3. ❌ Invalid project name
4. ❌ Fatal error during file operations
5. ✅ Successful completion

---

**Note**: This flow represents the current implementation as of version 1.0.0