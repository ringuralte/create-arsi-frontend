# Quick Reference Card

## Installation & Usage

```bash
# Create new project
npx create-arsi-app my-app

# Interactive mode
npx create-arsi-app

# With project name
npx create-arsi-app my-awesome-app
```

## Testing Locally

```bash
# Clone and setup
git clone <repo-url>
cd arsi-frontend-starter
pnpm install

# Test CLI
node bin/cli.js test-project

# Test as installed package
npm link
create-arsi-app test-project
npm unlink -g create-arsi-app

# Clean up
rm -rf test-*
```

## Project Structure

```
arsi-frontend-starter/
├── bin/cli.js              # Main CLI (entry point)
├── templates/
│   ├── base/               # Always included
│   └── [template-name]/    # User-selectable templates
├── package.json            # CLI dependencies
└── README.md               # Documentation
```

## Adding a New Template

1. Create directory: `templates/my-template/`
2. Add files and structure
3. Create `package.json` with dependencies
4. Test: `node bin/cli.js test --template=my-template`
5. CLI auto-detects it!

## Template Structure Example

```
templates/my-template/
├── app/
│   ├── routes/
│   ├── components/
│   └── lib/
├── public/
├── package.json           # Required
├── tsconfig.json          # Optional
├── vite.config.ts         # Optional
└── README.md              # Optional
```

## CLI Options Flow

1. Project name
2. Template selection (auto-detected from templates/)
3. TypeScript? (yes/no)
4. ESLint? (yes/no)
5. Husky? (yes/no)
6. Package manager? (pnpm/npm/yarn)

## Key Functions

| Function | Purpose |
|----------|---------|
| `getAvailableTemplates()` | Scans templates/ directory |
| `copyTemplate()` | Copies files with filtering |
| `mergePackageJsons()` | Combines package.json files |
| `removeTypeScriptFiles()` | Removes TS when disabled |
| `convertToJavaScript()` | TS→JS conversion |
| `createGitignore()` | Generates .gitignore |

## What Gets Copied

### Always Copied
- `templates/base/` → All files
- `templates/{selected}/` → All files

### Filtered Out
- `node_modules/`
- `*-lock.yaml`, `*-lock.json`
- `package.json` (merged separately)

### Conditionally Copied
- `tsconfig.json` → Only if TypeScript enabled
- `eslint.config.js` → Only if ESLint enabled
- `.husky/` → Only if Husky enabled

## Dependencies

```json
{
  "chalk": "^5.3.0",        // Colors
  "commander": "^12.1.0",   // CLI framework
  "inquirer": "^12.2.0",    // Prompts
  "ora": "^8.1.1",          // Spinners
  "fs-extra": "^11.2.0",    // File ops
  "execa": "^9.5.2"         // Process exec
}
```

## Common Commands

```bash
# Version
node bin/cli.js --version

# Help
node bin/cli.js --help

# Create with name
node bin/cli.js my-project

# Check for errors
pnpm lint  # if you have eslint setup
```

## Generated Project Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start dev server |
| `build` | Build for production |
| `start` | Start production server |
| `typecheck` | Type checking (if TS) |
| `lint` | Run linting (if ESLint) |
| `lint:fix` | Fix lint errors (if ESLint) |

## File Paths

All paths relative to project root:

- CLI: `bin/cli.js`
- Templates: `templates/`
- Base: `templates/base/`
- Docs: `*.md` files

## Debug Tips

```bash
# See what templates are detected
ls -la templates/

# Check CLI loads
node -e "import('./bin/cli.js')"

# Verbose npm
npm install --loglevel=verbose

# Check Node version
node --version  # Should be 18+
```

## Publishing Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Test all scenarios
- [ ] Run `npm publish`

## Quick Fixes

**CLI not found?**
```bash
npm link
```

**Dependencies not installing?**
```bash
cd project-dir
rm -rf node_modules
pnpm install
```

**Template not detected?**
- Check it's in `templates/` directory
- Check it's not named `base`
- Check it has `package.json`

## Environment

- **Node**: 18+ or 20+
- **Package Managers**: pnpm, npm, or yarn
- **OS**: Windows, macOS, Linux

## Important Files

| File | Purpose |
|------|---------|
| `bin/cli.js` | Main CLI logic |
| `package.json` | CLI dependencies & metadata |
| `README.md` | User documentation |
| `TESTING.md` | Testing checklist |
| `CHANGELOG.md` | Version history |

## Template Requirements

- Must have `package.json`
- Should have complete app structure
- Can include any config files
- Will be merged with `base/`

## Error Messages

| Error | Solution |
|-------|----------|
| No templates found | Add template to `templates/` |
| Directory exists | Choose to overwrite or cancel |
| Install failed | Run install manually |
| Git init failed | Continue (optional step) |

## Testing Scenarios

1. ✅ All options enabled
2. ✅ All options disabled
3. ✅ TypeScript only
4. ✅ ESLint only
5. ✅ Husky only
6. ✅ Different package managers
7. ✅ Overwrite existing dir
8. ✅ Interactive mode

## Links

- [README](./README.md) - Full documentation
- [TESTING](./TESTING.md) - Test checklist
- [CHANGELOG](./CHANGELOG.md) - Version history
- [CLI_FLOW](./CLI_FLOW.md) - Flow diagram

---

**Last Updated**: January 2024
**Version**: 1.0.0