# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of create-arsi-app CLI
- Support for complete template selection
- SSR FS Shadcn GraphQL template with:
  - React Router v7 with Server-Side Rendering
  - File-system based routing via @react-router/fs-routes
  - shadcn/ui components pre-configured
  - Tailwind CSS v4
  - GraphQL client with graphql-request
  - TanStack Query for data fetching
- Base template with common utilities and configurations
- Optional TypeScript support
- Optional ESLint with @antfu/eslint-config
- Optional Husky for git hooks with commitlint
- Support for multiple package managers (pnpm, npm, yarn)
- Interactive CLI prompts for project configuration
- Automatic dependency installation
- Git repository initialization
- Comprehensive project documentation

### Features
- Template auto-detection from templates directory
- Smart package.json merging from base and selected template
- Conditional file copying based on user selections
- TypeScript to JavaScript conversion when TypeScript is disabled
- Automatic removal of unused configurations
- Color-coded terminal output with ora spinners
- Template-specific setup instructions
- Proper .gitignore generation

### Documentation
- Comprehensive README with usage instructions
- Template-specific documentation
- Contributing guidelines
- Development workflow documentation

## [Unreleased]

### Planned
- Additional templates (Tanstack Router, Mantine UI, etc.)
- Modular template system for mix-and-match options
- Support for additional state management libraries (Zustand, Redux)
- Testing setup options (Vitest, React Testing Library)
- Docker configuration option
- CI/CD templates (GitHub Actions, GitLab CI)
- Storybook integration option
- i18n setup option