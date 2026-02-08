import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const key = 'test-key';
  const initialValue = 'initial';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toBe(initialValue);
  });

  it('returns stored value from localStorage', () => {
    localStorage.setItem(key, JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toBe('stored');
  });

  it('updates value with direct setter', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(JSON.parse(localStorage.getItem(key)!)).toBe('new-value');
  });

  it('updates value with updater function', () => {
    const { result } = renderHook(() => useLocalStorage(key, 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('handles complex objects', () => {
    const initial = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage(key, initial));

    act(() => {
      result.current[1]({ name: 'updated', count: 1 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 1 });
  });

  it('re-reads from localStorage when key changes', () => {
    localStorage.setItem('key-a', JSON.stringify('value-a'));
    localStorage.setItem('key-b', JSON.stringify('value-b'));

    const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 'default'), {
      initialProps: { k: 'key-a' },
    });

    expect(result.current[0]).toBe('value-a');

    rerender({ k: 'key-b' });
    expect(result.current[0]).toBe('value-b');
  });

  it('handles JSON parse errors gracefully', () => {
    localStorage.setItem(key, 'not-valid-json');
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    expect(result.current[0]).toBe(initialValue);
    consoleWarn.mockRestore();
  });

  it('syncs across tabs via storage event', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify('from-other-tab'),
        }),
      );
    });

    expect(result.current[0]).toBe('from-other-tab');
  });

  it('ignores storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'other-key',
          newValue: JSON.stringify('other-value'),
        }),
      );
    });

    expect(result.current[0]).toBe(initialValue);
  });
});
