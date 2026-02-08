import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle';

vi.mock('@/lib/config', () => ({
  APP_CONFIG: { name: 'TestApp' },
}));

describe('useDocumentTitle', () => {
  const originalTitle = 'Original Title';

  beforeEach(() => {
    document.title = originalTitle;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document title with app name suffix', () => {
    renderHook(() => useDocumentTitle('My Page'));
    expect(document.title).toBe('My Page | TestApp');
  });

  it('sets just app name when title is undefined', () => {
    renderHook(() => useDocumentTitle(undefined));
    expect(document.title).toBe('TestApp');
  });

  it('sets just app name when title is empty string', () => {
    renderHook(() => useDocumentTitle(''));
    expect(document.title).toBe('TestApp');
  });

  it('restores previous title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('My Page'));
    expect(document.title).toBe('My Page | TestApp');

    unmount();
    expect(document.title).toBe(originalTitle);
  });

  it('updates title when title prop changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Page 1' },
    });

    expect(document.title).toBe('Page 1 | TestApp');

    rerender({ title: 'Page 2' });
    expect(document.title).toBe('Page 2 | TestApp');
  });

  it('handles title with special characters', () => {
    renderHook(() => useDocumentTitle('Page & "Title" | More'));
    expect(document.title).toBe('Page & "Title" | More | TestApp');
  });
});
