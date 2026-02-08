import { describe, expect, it, vi } from 'vitest';

import { getEditorRoute, getSharedPromptUrl, ROUTES } from './routes';

describe('routes', () => {
  describe('ROUTES', () => {
    it('defines expected route patterns', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.EDITOR).toBe('/prompt/:id');
      expect(ROUTES.SHARED_PROMPT).toBe('/s/:shareToken');
      expect(ROUTES.NOT_FOUND).toBe('*');
    });
  });

  describe('getEditorRoute', () => {
    it('generates editor route for a prompt ID', () => {
      expect(getEditorRoute('abc-123')).toBe('/prompt/abc-123');
    });
  });

  describe('getSharedPromptUrl', () => {
    it('uses VITE_APP_URL when set', () => {
      vi.stubEnv('VITE_APP_URL', 'https://example.com');
      expect(getSharedPromptUrl('token-1')).toBe('https://example.com/s/token-1');
      vi.unstubAllEnvs();
    });

    it('falls back to window.location.origin', () => {
      vi.stubEnv('VITE_APP_URL', '');
      expect(getSharedPromptUrl('token-2')).toBe(`${window.location.origin}/s/token-2`);
      vi.unstubAllEnvs();
    });
  });
});
