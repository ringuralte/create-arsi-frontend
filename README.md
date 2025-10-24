# Create ARSI App

A flexible React starter template CLI with pre-configured setups for modern React applications.

## Features

- 🚀 **Multiple Templates**: Choose from pre-configured complete templates
- ⚡ **Vite-powered**: Fast development and optimized builds
- 🎨 **UI Frameworks**: Pre-configured with Tailwind CSS and shadcn/ui
- 🔄 **React Router v7**: Modern routing with file-system based routes and SSR support
- 📊 **State Management**: TanStack Query for server state
- 🔍 **GraphQL Ready**: GraphQL client with code generation
- 🎯 **TypeScript**: Full TypeScript support (optional)
- 🔧 **ESLint**: Pre-configured linting (optional)
- 🪝 **Git Hooks**: Husky for pre-commit hooks and commitlint (optional)
- 📦 **Package Manager**: Support for pnpm, npm, or yarn

## Quick Start

```bash
# Using npx (npm)
npx create-arsi-app my-app

# Using pnpm
pnpm create arsi-app my-app

# Using yarn
yarn create arsi-app my-app
```

## Interactive Mode

Run without arguments to enter interactive mode:

```bash
npx create-arsi-app
```

You'll be prompted to:
1. Choose a project name
2. Select a template
3. Enable/disable TypeScript
4. Enable/disable ESLint
5. Enable/disable Husky (git hooks)
6. Choose your preferred package manager

## Available Templates

### SSR FS Shadcn GraphQL
A complete React application template with:
- **React Router v7** with Server-Side Rendering (SSR)
- **File-system based routing** via `@react-router/fs-routes`
- **shadcn/ui** components pre-configured
- **Tailwind CSS v4** for styling
- **GraphQL** client with `graphql-request`
- **TanStack Query** for data fetching and caching
- **TypeScript** support
- **ESLint** with `@antfu/eslint-config`
- **Vite** for blazing fast builds

## Project Structure

After creating a project, you'll get:

```
my-app/
├── app/
│   ├── components/     # Reusable components
│   ├── lib/           # Utility functions and GraphQL client
│   ├── routes/        # File-system based routes
│   ├── app.css        # Global styles
│   ├── root.tsx       # Root layout
│   └── routes.ts      # Route configuration
├── public/            # Static assets
├── .husky/            # Git hooks (if enabled)
├── eslint.config.js   # ESLint configuration (if enabled)
├── tsconfig.json      # TypeScript config (if enabled)
├── vite.config.ts     # Vite configuration
├── package.json
└── .gitignore
```

## Development

```bash
# Navigate to your project
cd my-app

# Start development server
pnpm dev          # or npm run dev / yarn dev

# Build for production
pnpm build        # or npm run build / yarn build

# Start production server
pnpm start        # or npm start / yarn start
```

## Scripts

The generated project includes these scripts:

- `dev` - Start development server
- `build:production` - Build for production
- `build:staging` - Build for staging environment
- `start` - Start production server
- `start:production` - Start production server on port 3000
- `start:staging` - Start staging server on port 3001
- `typecheck` - Run TypeScript type checking (if TypeScript enabled)
- `lint` - Run ESLint (if ESLint enabled)
- `lint:fix` - Fix ESLint errors (if ESLint enabled)
- `codegen` - Generate GraphQL types (SSR FS Shadcn GraphQL template)

## GraphQL Setup (SSR FS Shadcn GraphQL Template)

1. Update your GraphQL schema location in `codegen.ts`:

```typescript
schema: 'https://your-api.com/graphql', // or path to local schema file
```

2. Generate types:

```bash
pnpm codegen
```

3. Use the GraphQL client in your components:

```typescript
import { graphqlClient } from '~/lib/graphql-client'

const data = await graphqlClient.request(query, variables)
```

## Customization

### Adding shadcn/ui Components

```bash
npx shadcn@latest add button
```

### Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_URL=https://your-api.com
```

Access in your code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Git Hooks (Husky)

If you enabled Husky, the following hooks are set up:

- **pre-commit**: Runs lint-staged to format and lint staged files
- **commit-msg**: Validates commit messages using commitlint

### Commit Message Format

Follow the Conventional Commits specification:

```
type(scope?): subject

Examples:
feat: add user authentication
fix: resolve login redirect issue
docs: update README
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## Package Manager Support

This CLI supports three package managers:

- **pnpm** (recommended) - Fast, disk space efficient
- **npm** - Default Node.js package manager
- **yarn** - Popular alternative

The CLI will detect and use your preferred package manager.

## Requirements

- Node.js 18+ or 20+
- One of: pnpm, npm, or yarn

## Publishing (For Maintainers)

To publish this package to npm:

```bash
# Update version in package.json
npm version patch|minor|major

# Publish to npm
npm publish
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Template Development

To add a new template:

1. Create a new directory in `templates/` (e.g., `templates/my-new-template/`)
2. Add a `package.json` with dependencies
3. Add the template files and structure
4. The CLI will automatically detect and list it

Templates should include:
- `package.json` with all required dependencies
- Project structure and source files
- Configuration files (tsconfig, vite.config, etc.)

## License

ISC

## Author

ringuralte

---

**Made with ❤️ for the React community**