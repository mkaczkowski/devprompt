import { ClerkProvider } from '@clerk/react-router';
import { shadcn } from '@clerk/themes';
import type { Appearance } from '@clerk/types';
import type { ReactNode } from 'react';

interface ClerkThemeProviderProps {
  children: ReactNode;
  publishableKey: string;
}

/**
 * Clerk appearance configuration.
 * Uses shadcn theme which auto-adapts to light/dark mode.
 * Requires @clerk/themes/shadcn.css to be imported in index.css.
 */
const appearance: Appearance = {
  baseTheme: shadcn,
  variables: {
    // Typography
    fontFamily: '"Inter Variable", sans-serif',
    // Match app's border radius (--radius: 0.375rem in index.css)
    borderRadius: '0.375rem',
  },
  elements: {
    // Make modal fullscreen on mobile devices
    modalBackdrop: 'backdrop-blur-sm',
    modalContent: 'sm:max-w-md max-sm:min-h-svh max-sm:min-w-full max-sm:rounded-none',
    card: 'max-sm:rounded-none max-sm:shadow-none',
    // Ensure consistent border radius on form elements
    formFieldInput: 'rounded-md',
    formButtonPrimary: 'rounded-md',
    socialButtonsBlockButton: 'rounded-md',
  },
};

/**
 * ClerkProvider wrapper with consistent theming.
 */
export function ClerkThemeProvider({ children, publishableKey }: ClerkThemeProviderProps) {
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/" appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
