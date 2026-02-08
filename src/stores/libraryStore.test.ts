import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/lib/storageKeys';
import { useFilteredPrompts, useLibraryStore } from '@/stores/libraryStore';
import type { DeletedPromptResult, PromptMetadata } from '@/types';

// Mock crypto.randomUUID
const mockUUID = vi.fn();
vi.stubGlobal('crypto', { randomUUID: mockUUID });

describe('libraryStore', () => {
  beforeEach(() => {
    mockUUID.mockReturnValue('test-uuid');
    localStorage.clear();
    act(() => useLibraryStore.getState().reset());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createPromptMetadata = (overrides: Partial<PromptMetadata> = {}): PromptMetadata => ({
    id: 'prompt-1',
    title: 'Test Prompt',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  describe('setSearchQuery', () => {
    it('sets the search query', () => {
      act(() => useLibraryStore.getState().setSearchQuery('test query'));
      expect(useLibraryStore.getState().searchQuery).toBe('test query');
    });
  });

  describe('setSortBy', () => {
    it.each(['name', 'dateModified'] as const)('sets sortBy to %s', (sortBy) => {
      act(() => useLibraryStore.getState().setSortBy(sortBy));
      expect(useLibraryStore.getState().sortBy).toBe(sortBy);
    });
  });

  describe('setSortDirection', () => {
    it.each(['asc', 'desc'] as const)('sets sortDirection to %s', (direction) => {
      act(() => useLibraryStore.getState().setSortDirection(direction));
      expect(useLibraryStore.getState().sortDirection).toBe(direction);
    });
  });

  describe('addPrompt', () => {
    it('adds a new prompt with generated id and timestamps', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      mockUUID.mockReturnValue('new-prompt-id');

      let id: string = '';
      act(() => {
        id = useLibraryStore.getState().addPrompt({ title: 'New Prompt' });
      });

      expect(id).toBe('new-prompt-id');
      const prompt = useLibraryStore.getState().prompts[0];
      expect(prompt.id).toBe('new-prompt-id');
      expect(prompt.title).toBe('New Prompt');
      expect(prompt.createdAt).toBe(1000);
      expect(prompt.updatedAt).toBe(1000);
    });

    it('saves initial prompt data to localStorage', () => {
      mockUUID.mockReturnValue('new-prompt-id');

      act(() => {
        useLibraryStore.getState().addPrompt({ title: 'New Prompt' });
      });

      const data = localStorage.getItem(STORAGE_KEYS.prompt('new-prompt-id'));
      expect(data).toBeTruthy();
      expect(JSON.parse(data!)).toEqual({ title: 'New Prompt', sections: [], tokenCount: 0 });
    });
  });

  describe('updatePrompt', () => {
    it('updates prompt metadata', () => {
      useLibraryStore.setState({ prompts: [createPromptMetadata({ id: 'p1', title: 'Old' })] });
      vi.spyOn(Date, 'now').mockReturnValue(2000);

      act(() => useLibraryStore.getState().updatePrompt('p1', { title: 'New Title' }));

      const prompt = useLibraryStore.getState().prompts[0];
      expect(prompt.title).toBe('New Title');
      expect(prompt.updatedAt).toBe(2000);
    });

    it('does not affect non-matching prompts', () => {
      useLibraryStore.setState({
        prompts: [
          createPromptMetadata({ id: 'p1', title: 'First' }),
          createPromptMetadata({ id: 'p2', title: 'Second' }),
        ],
      });

      act(() => useLibraryStore.getState().updatePrompt('p1', { title: 'Updated' }));

      expect(useLibraryStore.getState().prompts[1].title).toBe('Second');
    });
  });

  describe('deletePrompt', () => {
    it('removes prompt and returns deleted result', () => {
      const prompt = createPromptMetadata({ id: 'p1' });
      useLibraryStore.setState({ prompts: [prompt] });
      localStorage.setItem(STORAGE_KEYS.prompt('p1'), JSON.stringify({ title: 'Test', sections: [] }));

      let result: DeletedPromptResult | null = null;
      act(() => {
        result = useLibraryStore.getState().deletePrompt('p1');
      });

      expect(result).toEqual({
        id: 'p1',
        data: { title: 'Test', sections: [] },
      });
      expect(useLibraryStore.getState().prompts).toHaveLength(0);
      expect(localStorage.getItem(STORAGE_KEYS.prompt('p1'))).toBeNull();
    });

    it('returns null for non-existent prompt', () => {
      let result: DeletedPromptResult | null = null;
      act(() => {
        result = useLibraryStore.getState().deletePrompt('non-existent');
      });

      expect(result).toBeNull();
    });
  });

  describe('restorePrompt', () => {
    it('restores prompt metadata and data', () => {
      vi.spyOn(Date, 'now').mockReturnValue(3000);

      act(() => {
        useLibraryStore.getState().restorePrompt('restored-id', {
          title: 'Restored',
          sections: [],
        });
      });

      const prompts = useLibraryStore.getState().prompts;
      expect(prompts).toHaveLength(1);
      expect(prompts[0].id).toBe('restored-id');
      expect(prompts[0].title).toBe('Restored');

      const data = localStorage.getItem(STORAGE_KEYS.prompt('restored-id'));
      expect(JSON.parse(data!)).toEqual({ title: 'Restored', sections: [], tokenCount: 0 });
    });
  });

  describe('duplicatePrompt', () => {
    it('creates a copy of the prompt', () => {
      useLibraryStore.setState({
        prompts: [createPromptMetadata({ id: 'original', title: 'Original' })],
      });
      localStorage.setItem(
        STORAGE_KEYS.prompt('original'),
        JSON.stringify({ title: 'Original', sections: [{ id: 's1', title: 'Section' }] }),
      );
      mockUUID.mockReturnValueOnce('duplicate-id').mockReturnValue('new-section-id');

      let newId: string = '';
      act(() => {
        newId = useLibraryStore.getState().duplicatePrompt('original');
      });

      expect(newId).toBe('duplicate-id');
      const prompts = useLibraryStore.getState().prompts;
      expect(prompts).toHaveLength(2);
      expect(prompts[1].title).toBe('Original (Copy)');
    });

    it('returns empty string for non-existent prompt', () => {
      let newId: string = '';
      act(() => {
        newId = useLibraryStore.getState().duplicatePrompt('non-existent');
      });

      expect(newId).toBe('');
    });
  });

  describe('canDelete', () => {
    it('returns true for existing prompt', () => {
      useLibraryStore.setState({ prompts: [createPromptMetadata({ id: 'p1' })] });
      expect(useLibraryStore.getState().canDelete('p1')).toBe(true);
    });

    it('returns false for non-existent prompt', () => {
      expect(useLibraryStore.getState().canDelete('non-existent')).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      useLibraryStore.setState({
        prompts: [createPromptMetadata()],
        searchQuery: 'test',
        sortBy: 'name',
        sortDirection: 'asc',
      });

      act(() => useLibraryStore.getState().reset());

      const state = useLibraryStore.getState();
      expect(state.prompts).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(state.sortBy).toBe('dateModified');
      expect(state.sortDirection).toBe('desc');
    });
  });
});

describe('useFilteredPrompts', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => useLibraryStore.getState().reset());
  });

  const createPromptMetadata = (overrides: Partial<PromptMetadata> = {}): PromptMetadata => ({
    id: 'prompt-1',
    title: 'Test Prompt',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  });

  it('returns all prompts when no filters are applied', () => {
    useLibraryStore.setState({
      prompts: [createPromptMetadata({ id: 'p1' }), createPromptMetadata({ id: 'p2' })],
    });

    const { result } = renderHook(() => useFilteredPrompts());
    expect(result.current).toHaveLength(2);
  });

  it('filters prompts by search query', () => {
    useLibraryStore.setState({
      prompts: [
        createPromptMetadata({ id: 'p1', title: 'Apple' }),
        createPromptMetadata({ id: 'p2', title: 'Banana' }),
        createPromptMetadata({ id: 'p3', title: 'Cherry' }),
      ],
      searchQuery: 'ban',
    });

    const { result } = renderHook(() => useFilteredPrompts());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Banana');
  });

  it('filters prompts by description', () => {
    useLibraryStore.setState({
      prompts: [
        createPromptMetadata({ id: 'p1', title: 'First', description: 'Apple description' }),
        createPromptMetadata({ id: 'p2', title: 'Second', description: 'Banana description' }),
      ],
      searchQuery: 'apple',
    });

    const { result } = renderHook(() => useFilteredPrompts());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('First');
  });

  it('sorts prompts by name ascending', () => {
    useLibraryStore.setState({
      prompts: [
        createPromptMetadata({ id: 'p1', title: 'Cherry' }),
        createPromptMetadata({ id: 'p2', title: 'Apple' }),
        createPromptMetadata({ id: 'p3', title: 'Banana' }),
      ],
      sortBy: 'name',
      sortDirection: 'asc',
    });

    const { result } = renderHook(() => useFilteredPrompts());
    expect(result.current.map((p) => p.title)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('sorts prompts by name descending', () => {
    useLibraryStore.setState({
      prompts: [
        createPromptMetadata({ id: 'p1', title: 'Cherry' }),
        createPromptMetadata({ id: 'p2', title: 'Apple' }),
        createPromptMetadata({ id: 'p3', title: 'Banana' }),
      ],
      sortBy: 'name',
      sortDirection: 'desc',
    });

    const { result } = renderHook(() => useFilteredPrompts());
    expect(result.current.map((p) => p.title)).toEqual(['Cherry', 'Banana', 'Apple']);
  });

  it('sorts prompts by dateModified descending', () => {
    useLibraryStore.setState({
      prompts: [
        createPromptMetadata({ id: 'p1', title: 'First', updatedAt: 1000 }),
        createPromptMetadata({ id: 'p2', title: 'Second', updatedAt: 3000 }),
        createPromptMetadata({ id: 'p3', title: 'Third', updatedAt: 2000 }),
      ],
      sortBy: 'dateModified',
      sortDirection: 'desc',
    });

    const { result } = renderHook(() => useFilteredPrompts());
    expect(result.current.map((p) => p.title)).toEqual(['Second', 'Third', 'First']);
  });

  it('combines search and sort', () => {
    useLibraryStore.setState({
      prompts: [
        createPromptMetadata({ id: 'p1', title: 'Apple Pie', updatedAt: 1000 }),
        createPromptMetadata({ id: 'p2', title: 'Apple Tart', updatedAt: 3000 }),
        createPromptMetadata({ id: 'p3', title: 'Banana Split', updatedAt: 2000 }),
      ],
      searchQuery: 'apple',
      sortBy: 'dateModified',
      sortDirection: 'desc',
    });

    const { result } = renderHook(() => useFilteredPrompts());
    expect(result.current).toHaveLength(2);
    expect(result.current.map((p) => p.title)).toEqual(['Apple Tart', 'Apple Pie']);
  });
});
