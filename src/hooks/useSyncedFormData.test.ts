import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSyncedFormData } from './useSyncedFormData';

describe('useSyncedFormData', () => {
  it('returns source data initially', () => {
    const { result } = renderHook(() => useSyncedFormData({ name: 'test' }, 'trigger-1'));
    expect(result.current[0]).toEqual({ name: 'test' });
  });

  it('provides a setter function', () => {
    const { result } = renderHook(() => useSyncedFormData({ name: 'initial' }, 'trigger-1'));
    expect(typeof result.current[1]).toBe('function');
  });

  it('syncs when trigger value changes', () => {
    const { result, rerender } = renderHook(
      ({ sourceData, syncTrigger }) => useSyncedFormData(sourceData, syncTrigger),
      { initialProps: { sourceData: { name: 'v1' }, syncTrigger: 'trigger-1' } },
    );

    expect(result.current[0]).toEqual({ name: 'v1' });

    // Trigger changes - should sync to new source data
    rerender({ sourceData: { name: 'v2' }, syncTrigger: 'trigger-2' });
    expect(result.current[0]).toEqual({ name: 'v2' });
  });

  it('syncs when source data changes with same trigger', () => {
    const { result, rerender } = renderHook(
      ({ sourceData, syncTrigger }) => useSyncedFormData(sourceData, syncTrigger),
      { initialProps: { sourceData: { name: 'v1' }, syncTrigger: 'trigger-1' } },
    );

    // Source data changes (trigger also changes per useEffect deps)
    rerender({ sourceData: { name: 'v2' }, syncTrigger: 'trigger-1' });
    // Per the implementation, it syncs when either trigger or sourceData changes
    expect(result.current[0]).toEqual({ name: 'v2' });
  });

  it('handles dialog open/close pattern (boolean trigger)', () => {
    const { result, rerender } = renderHook(
      ({ sourceData, syncTrigger }) => useSyncedFormData(sourceData, syncTrigger),
      { initialProps: { sourceData: { name: 'original' }, syncTrigger: false } },
    );

    // Dialog opens
    rerender({ sourceData: { name: 'original' }, syncTrigger: true });
    expect(result.current[0]).toEqual({ name: 'original' });

    // Dialog closes
    rerender({ sourceData: { name: 'original' }, syncTrigger: false });
    expect(result.current[0]).toEqual({ name: 'original' });

    // Dialog reopens with new data
    rerender({ sourceData: { name: 'new-data' }, syncTrigger: true });
    expect(result.current[0]).toEqual({ name: 'new-data' });
  });

  it('handles ID-based trigger pattern', () => {
    const { result, rerender } = renderHook(
      ({ sourceData, syncTrigger }) => useSyncedFormData(sourceData, syncTrigger),
      { initialProps: { sourceData: { name: 'item-1' }, syncTrigger: 'id-1' } },
    );

    // Switch to item 2
    rerender({ sourceData: { name: 'item-2' }, syncTrigger: 'id-2' });
    expect(result.current[0]).toEqual({ name: 'item-2' });

    // Switch back to item 1
    rerender({ sourceData: { name: 'item-1' }, syncTrigger: 'id-1' });
    expect(result.current[0]).toEqual({ name: 'item-1' });
  });
});
