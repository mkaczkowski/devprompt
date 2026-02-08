# DevPrompt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

A prompt management tool that parses markdown into sections for selective copying. Perfect for developers and AI practitioners who work with structured prompts.

## Features

- **Markdown Parsing** - Automatically parses markdown content into manageable sections
- **Selective Copying** - Copy individual sections or combine multiple sections as needed
- **Syntax Highlighting** - Built-in syntax highlighting for code blocks
- **Dark/Light Theme** - System-aware theming with manual override
- **Cloud Sync** - Optional Supabase integration for syncing prompts across devices
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Drag & Drop** - Reorder sections with intuitive drag and drop
- **Prompt Sharing** - Share prompts via unique links with anyone
- **Local Storage** - Prompts persist locally with optional cloud backup
- **PWA Support** - Installable as a native app with offline app shell loading

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **State Management**: Zustand
- **Authentication**: Clerk
- **Database**: Supabase (optional)
- **Testing**: Vitest + Playwright
- **i18n**: LinguiJS

## Prerequisites

- Node.js >= 22.0.0 (see `.nvmrc`)
- npm

## Installation

```bash
# Clone the repository
git clone https://github.com/mkaczkowski/webapp-client.git
cd webapp-client

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                     | Description                    | Required |
| ---------------------------- | ------------------------------ | -------- |
| `VITE_APP_NAME`              | Application display name       | No       |
| `VITE_APP_URL`               | Application URL                | No       |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication key       | Yes      |
| `CLERK_SECRET_KEY`           | Clerk secret key for E2E tests | No       |
| `E2E_CLERK_USER_EMAIL`       | Test user email for E2E        | No       |
| `E2E_CLERK_USER_PASSWORD`    | Test user password for E2E     | No       |
| `VITE_SUPABASE_DATABASE_URL` | Supabase project URL           | No       |
| `VITE_SUPABASE_ANON_KEY`     | Supabase anonymous key         | No       |
| `SUPABASE_PROJECT_ID`        | Supabase project ID for types  | No       |
| `VITE_SENTRY_DSN`            | Sentry error tracking DSN      | No       |

## Development

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run e2e

# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Testing

The project maintains 80% code coverage threshold:

```bash
# Run unit tests
npm run test

# Run with coverage report
npm run test:coverage

# Run E2E tests (desktop)
npm run e2e

# Run E2E tests (mobile)
npm run e2e:mobile

# Run E2E tests with UI
npm run e2e:ui
```

## Project Structure

```
src/
├── components/    # UI primitives, layout, and shared components
├── contexts/      # React Context providers
├── hooks/         # Custom React hooks
├── lib/           # Utilities, config, and helpers
├── locales/       # i18n message catalogs (LinguiJS)
├── pages/         # Route components (lazy-loaded)
├── stores/        # Zustand state stores
└── types/         # TypeScript type definitions

e2e/               # Playwright E2E tests
```

## PWA

DevPrompt is a Progressive Web App. After visiting the production site, the app shell is cached for fast subsequent loads and offline access. Users can install it as a standalone app from the browser's install prompt.

- **Installable** - Add to home screen on mobile or install on desktop via the browser address bar
- **Offline shell** - The app shell (HTML, CSS, JS, fonts, icons) loads offline; data operations still require a network connection
- **Update prompt** - When a new version is deployed, users see a non-intrusive toast to reload

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
