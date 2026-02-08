/**
 * Global type declarations for React 19 compatibility.
 *
 * @dnd-kit packages use legacy JSX types that conflict with React 19's
 * new JSX transform. This declaration extends the global JSX namespace
 * to provide compatibility.
 */

import type { JSX as ReactJSX } from 'react';

declare global {
  namespace JSX {
    // @ts-expect-error Required for @dnd-kit React 19 compatibility
    type Element = ReactJSX.Element;
    // @ts-expect-error Required for @dnd-kit React 19 compatibility
    type IntrinsicElements = ReactJSX.IntrinsicElements;
  }
}

export {};
