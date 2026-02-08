# Contributing to DevPrompt

Thank you for your interest in contributing to DevPrompt! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js >= 22.0.0 (check `.nvmrc`)
- npm

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/webapp-client.git
   cd webapp-client
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feat/add-user-authentication`
- `fix/copy-button-not-working`
- `docs/update-readme`
- `refactor/simplify-parser`

### Making Changes

1. Create a new branch from `master`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes following our coding standards
3. Write or update tests as needed
4. Ensure all tests pass:
   ```bash
   npm run test
   npm run e2e
   ```
5. Ensure code passes linting:
   ```bash
   npm run lint
   npm run format:check
   ```
6. Commit your changes following our commit conventions

### Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are enforced by commitlint.

Format: `type(scope): description`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(editor): add drag-and-drop section reordering
fix(parser): handle empty markdown sections correctly
docs(readme): add installation instructions
test(storage): add unit tests for prompt persistence
```

### Pull Request Process

1. Update documentation if needed
2. Ensure your PR description clearly describes the problem and solution
3. Link any related issues
4. Request review from maintainers
5. Address review feedback
6. Once approved, your PR will be merged

### Pull Request Template

When creating a PR, please include:

- **What**: Brief description of changes
- **Why**: Motivation for the changes
- **How**: Implementation approach
- **Testing**: How you tested the changes
- **Screenshots**: If applicable

## Coding Standards

### TypeScript

- Use strict TypeScript settings
- Use `type` for unions, `interface` for objects
- Avoid `any` - use proper typing

### React Components

- Use named exports (except for lazy-loaded pages)
- Define `Props` interface for component props
- Keep components focused and small

### Imports

Always use the `@/` path alias:

```typescript
import { Button } from '@/components/ui/button';
import { usePromptStore } from '@/stores/promptStore';
```

### Testing

- Co-locate tests with source files (`*.test.ts/tsx`)
- Maintain 80% code coverage
- Write meaningful test descriptions

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Desktop tests
npm run e2e

# Mobile tests
npm run e2e:mobile

# All tests
npm run e2e:all

# Interactive UI mode
npm run e2e:ui
```

## Questions?

If you have questions, feel free to:

- Open a [GitHub Issue](https://github.com/mkaczkowski/webapp-client/issues)
- Start a [GitHub Discussion](https://github.com/mkaczkowski/webapp-client/discussions)

Thank you for contributing!
