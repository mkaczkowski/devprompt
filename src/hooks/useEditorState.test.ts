import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useEditorState } from './useEditorState';

import { usePreferencesStore } from '@/stores/preferencesStore';
import { usePromptStore } from '@/stores/promptStore';

describe('useEditorState', () => {
  beforeEach(() => {
    // Reset stores to initial state
    usePromptStore.setState({
      promptTitle: undefined,
      sections: [],
    });
    usePreferencesStore.setState({
      viewModes: [],
      previewFormat: 'markdown',
    });
  });

  it('returns prompt state from promptStore', () => {
    usePromptStore.setState({
      promptTitle: 'Test Title',
      sections: [{ id: '1', title: 'Section', content: 'Content', enabled: true, collapsed: false }],
    });

    const { result } = renderHook(() => useEditorState());

    expect(result.current.promptTitle).toBe('Test Title');
    expect(result.current.sections).toHaveLength(1);
  });

  it('returns preferences from preferencesStore', () => {
    usePreferencesStore.setState({
      viewModes: ['code', 'preview'],
      previewFormat: 'xml',
    });

    const { result } = renderHook(() => useEditorState());

    expect(result.current.viewModes).toEqual(['code', 'preview']);
    expect(result.current.previewFormat).toBe('xml');
  });

  it('returns actions from stores', () => {
    const { result } = renderHook(() => useEditorState());

    expect(typeof result.current.loadPrompt).toBe('function');
    expect(typeof result.current.setPromptTitle).toBe('function');
    expect(typeof result.current.addPrompt).toBe('function');
    expect(typeof result.current.updatePrompt).toBe('function');
  });

  it('setPromptTitle updates the store', () => {
    const { result } = renderHook(() => useEditorState());

    act(() => {
      result.current.setPromptTitle('New Title');
    });

    expect(usePromptStore.getState().promptTitle).toBe('New Title');
  });
});
