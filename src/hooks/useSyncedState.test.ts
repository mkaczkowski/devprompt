import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSyncedState } from './useSyncedState';

describe('useSyncedState', () => {
  it('returns external value initially', () => {
    const { result } = renderHook(() => useSyncedState('initial', false));
    expect(result.current[0]).toBe('initial');
  });

  it('updates local value via setter', () => {
    const { result } = renderHook(() => useSyncedState('initial', false));

    act(() => {
      result.current[1]('local-change');
    });

    expect(result.current[0]).toBe('local-change');
  });

  it('syncs with external value when not active', () => {
    const { result, rerender } = renderHook(({ externalValue, isActive }) => useSyncedState(externalValue, isActive), {
      initialProps: { externalValue: 'v1', isActive: false },
    });

    expect(result.current[0]).toBe('v1');

    // External value changes while not active - should sync
    rerender({ externalValue: 'v2', isActive: false });
    expect(result.current[0]).toBe('v2');
  });

  it('does not sync with external value while active', () => {
    const { result, rerender } = renderHook(({ externalValue, isActive }) => useSyncedState(externalValue, isActive), {
      initialProps: { externalValue: 'v1', isActive: true },
    });

    // Initial sync when becoming active
    expect(result.current[0]).toBe('v1');

    // User makes local edit while active
    act(() => {
      result.current[1]('local-edit');
    });
    expect(result.current[0]).toBe('local-edit');

    // External value changes while still active - should NOT sync (preserve user edit)
    rerender({ externalValue: 'v2', isActive: true });
    expect(result.current[0]).toBe('local-edit');
  });

  it('syncs when switching from active to inactive', () => {
    const { result, rerender } = renderHook(({ externalValue, isActive }) => useSyncedState(externalValue, isActive), {
      initialProps: { externalValue: 'v1', isActive: true },
    });

    // Make local edit while active
    act(() => {
      result.current[1]('local-edit');
    });
    expect(result.current[0]).toBe('local-edit');

    // External value changed while we were editing
    rerender({ externalValue: 'v2', isActive: true });
    expect(result.current[0]).toBe('local-edit');

    // Switch to inactive - should sync with new external value
    rerender({ externalValue: 'v2', isActive: false });
    expect(result.current[0]).toBe('v2');
  });

  it('syncs when switching from inactive to active (e.g., opening drawer)', () => {
    const { result, rerender } = renderHook(({ externalValue, isActive }) => useSyncedState(externalValue, isActive), {
      initialProps: { externalValue: '', isActive: false },
    });

    expect(result.current[0]).toBe('');

    // Simulate opening a drawer with new content - external value and isActive change together
    rerender({ externalValue: 'section content', isActive: true });

    // Should sync with the new external value when becoming active
    expect(result.current[0]).toBe('section content');
  });

  it('preserves local edits while active after initial sync', () => {
    const { result, rerender } = renderHook(({ externalValue, isActive }) => useSyncedState(externalValue, isActive), {
      initialProps: { externalValue: '', isActive: false },
    });

    // Open drawer with content
    rerender({ externalValue: 'initial content', isActive: true });
    expect(result.current[0]).toBe('initial content');

    // User edits locally
    act(() => {
      result.current[1]('user edited content');
    });
    expect(result.current[0]).toBe('user edited content');

    // External value changes (e.g., from another source) - should NOT overwrite user edit
    rerender({ externalValue: 'different content', isActive: true });
    expect(result.current[0]).toBe('user edited content');
  });

  it('works with complex objects', () => {
    const initial = { name: 'test', value: 1 };
    const { result, rerender } = renderHook(({ externalValue, isActive }) => useSyncedState(externalValue, isActive), {
      initialProps: { externalValue: initial, isActive: false },
    });

    expect(result.current[0]).toEqual(initial);

    const updated = { name: 'updated', value: 2 };
    rerender({ externalValue: updated, isActive: false });
    expect(result.current[0]).toEqual(updated);
  });
});
