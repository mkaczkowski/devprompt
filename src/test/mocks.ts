import { vi } from 'vitest';

/**
 * Creates a mock for window.matchMedia.
 * Usage: window.matchMedia = mockMatchMedia(true) // matches
 */
export const mockMatchMedia = (matches: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
