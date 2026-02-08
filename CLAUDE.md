# CLAUDE.md

AI assistant guidance for **webapp-client** - a React 19 + TypeScript + Vite 7 codebase.

## Commands

```bash
npm run build               # Production build (typecheck + bundle)
npm run dev                 # Dev server at localhost:5173
npm run e2e                 # Playwright E2E (desktop)
npm run e2e:mobile          # Playwright E2E (mobile)
npm run e2e:all             # Playwright E2E (all devices)
npm run e2e:ui              # Playwright UI mode
npm run format              # Prettier format
npm run format:check        # Prettier check
npm run lint                # ESLint check
npm run lint:fix            # ESLint auto-fix
npm run prepare             # Initialize Husky hooks
npm run preview             # Preview production build
npm run test                # Vitest once
npm run test:coverage       # Coverage (80% threshold)
npm run test:watch          # Vitest watch mode
npm run typecheck           # TypeScript only
```

## Project Structure

```
src/
├── components/    # ui/ (primitives), layout/, shared/ (features)
├── contexts/      # React Context providers
├── hooks/         # Custom hooks
├── lib/           # config, utils, format, routes, storage
├── pages/         # Lazy-loaded route components
├── stores/        # Zustand stores
└── types/         # TypeScript definitions

# Unit tests co-located: *.test.ts/tsx next to source
e2e/tests/         # Playwright functional E2E tests
```

## Code Patterns

**Imports**: Always use `@/` path alias

**Components**: Named exports + `Props` interface. Pages use default exports for lazy loading.

**TypeScript**: `type` for unions, `interface` for objects

**State hierarchy**: Zustand (persisted) → Context (UI) → useState (local)

## UI Components (Shadcn/UI)

This project uses **Shadcn/UI** with radix-nova style. Components live in `src/components/ui/`.

### Adding New Components

```bash
npx shadcn@latest add button           # Single component
npx shadcn@latest add dialog card input # Multiple components
```

**Pattern**: Import directly (no barrel exports for UI):

```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

## Mobile & Responsive Design

This project includes mobile-first responsive utilities.

### Viewport Detection

```tsx
import { MobileProvider, useMobileContext } from '@/contexts/mobileContext';

// Wrap app with MobileProvider
<MobileProvider>{children}</MobileProvider>;

// Use in components
const { isMobile, isTablet, isDesktop, width } = useMobileContext();
```

### Breakpoints

```tsx
import { BREAKPOINTS, useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';

// BREAKPOINTS: sm (640), md (768), lg (1024), xl (1280)
const isMobile = useIsMobile(); // width < 768px
const isDesktop = useIsDesktop(); // width >= 1024px
```

### Touch-Aware Sizing

```tsx
import { useTouchSizes } from '@/hooks/useTouchSizes';

const sizes = useTouchSizes();
<Button size={sizes.button}>Click</Button>; // 'touch' on mobile, 'default' on desktop
```

## Theming

Light/dark/system theme support with Zustand persistence.

### Usage

```tsx
import { usePreferencesStore } from '@/stores/preferencesStore';

// Get current theme
const theme = usePreferencesStore((s) => s.theme);

// Toggle theme
const toggleTheme = usePreferencesStore((s) => s.toggleTheme);

// Get resolved theme (actual light/dark value when 'system')
const getResolvedTheme = usePreferencesStore((s) => s.getResolvedTheme);
```

The `useThemeEffect` hook automatically applies the `.dark` class to the document.
The ThemeToggle component provides a UI for switching between light, dark, and system themes.

## MCP Servers (PREFER OVER WebSearch)

Use MCP servers for documentation lookup. They provide **structured, version-accurate data** directly from source.

### Shadcn MCP (UI Components)

| Need                | Tool                                             |
| ------------------- | ------------------------------------------------ |
| Find component      | `mcp__shadcn__search_items_in_registries`        |
| View component code | `mcp__shadcn__view_items_in_registries`          |
| Usage examples      | `mcp__shadcn__get_item_examples_from_registries` |
| CLI add command     | `mcp__shadcn__get_add_command_for_items`         |

### Context7 MCP (All Libraries)

Use for **any npm package** documentation:

```
resolve-library-id → get-library-docs
```

**Examples**: react-hook-form, @tanstack/react-query, zustand, zod, date-fns

### Decision Flow

```
Need UI component?     → Shadcn MCP
Need library docs?     → Context7 MCP (any npm package)
Need general info?     → WebSearch (fallback only)
```

## Testing

Unit tests are **co-located** with source files (`*.test.ts/tsx`). 80% coverage required.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen, renderHook } from '@testing-library/react';
import { render, mockMatchMedia, server } from '@/test';
```

MSW handlers auto-reset after each test.

## Common Gotchas

1. **Node.js >= 22.0.0** required (check `.nvmrc`)
2. **Conventional commits** enforced by commitlint
3. **Context hooks throw** outside provider (e.g., `useMobileContext()`)
4. **Barrel exports** in each directory via `index.ts`
5. **UI components** import directly: `@/components/ui/button` (no barrel)
