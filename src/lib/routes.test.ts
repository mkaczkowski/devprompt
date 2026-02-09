import { describe, expect, it } from 'vitest';

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
    it('generates full URL using window.location.origin', () => {
      expect(getSharedPromptUrl('token-1')).toBe(`${window.location.origin}/s/token-1`);
    });
  });
});
