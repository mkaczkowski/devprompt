import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/lib/storageKeys';
import { usePromptStore } from '@/stores/promptStore';
import type { RemovedSectionResult, Section } from '@/types';

// Mock crypto.randomUUID
const mockUUID = vi.fn();
vi.stubGlobal('crypto', { randomUUID: mockUUID });

describe('promptStore', () => {
  beforeEach(() => {
    mockUUID.mockReturnValue('test-uuid');
    localStorage.clear();
    act(() => usePromptStore.getState().reset());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createSection = (overrides: Partial<Section> = {}): Section => ({
    id: 'section-1',
    title: 'Test Section',
    content: 'Test content',
    enabled: true,
    collapsed: false,
    ...overrides,
  });

  describe('loadPrompt', () => {
    it('loads prompt from localStorage', () => {
      const promptId = 'test-prompt';
      const data = {
        title: 'Test Title',
        sections: [createSection()],
      };
      localStorage.setItem(STORAGE_KEYS.prompt(promptId), JSON.stringify(data));

      act(() => usePromptStore.getState().loadPrompt(promptId));

      const state = usePromptStore.getState();
      expect(state.promptId).toBe(promptId);
      expect(state.promptTitle).toBe('Test Title');
      expect(state.sections).toHaveLength(1);
    });

    it('resets state when promptId is undefined', () => {
      usePromptStore.setState({ promptId: 'existing', promptTitle: 'Existing' });

      act(() => usePromptStore.getState().loadPrompt(undefined));

      const state = usePromptStore.getState();
      expect(state.promptId).toBeNull();
      expect(state.promptTitle).toBeUndefined();
      expect(state.sections).toEqual([]);
    });

    it('handles missing prompt data gracefully', () => {
      act(() => usePromptStore.getState().loadPrompt('non-existent'));

      const state = usePromptStore.getState();
      expect(state.promptId).toBe('non-existent');
      expect(state.promptTitle).toBeUndefined();
      expect(state.sections).toEqual([]);
    });
  });

  describe('setPromptTitle', () => {
    it('sets the prompt title', () => {
      act(() => usePromptStore.getState().setPromptTitle('New Title'));
      expect(usePromptStore.getState().promptTitle).toBe('New Title');
    });

    it('clears the prompt title when undefined', () => {
      usePromptStore.setState({ promptTitle: 'Existing' });
      act(() => usePromptStore.getState().setPromptTitle(undefined));
      expect(usePromptStore.getState().promptTitle).toBeUndefined();
    });
  });

  describe('toggleEnabled', () => {
    it('toggles section enabled state', () => {
      usePromptStore.setState({ sections: [createSection({ id: 's1', enabled: true })] });

      act(() => usePromptStore.getState().toggleEnabled('s1'));

      expect(usePromptStore.getState().sections[0].enabled).toBe(false);
    });

    it('does not affect other sections', () => {
      usePromptStore.setState({
        sections: [createSection({ id: 's1', enabled: true }), createSection({ id: 's2', enabled: true })],
      });

      act(() => usePromptStore.getState().toggleEnabled('s1'));

      expect(usePromptStore.getState().sections[1].enabled).toBe(true);
    });
  });

  describe('toggleCollapsed', () => {
    it('toggles section collapsed state', () => {
      usePromptStore.setState({ sections: [createSection({ id: 's1', collapsed: false })] });

      act(() => usePromptStore.getState().toggleCollapsed('s1'));

      expect(usePromptStore.getState().sections[0].collapsed).toBe(true);
    });
  });

  describe('toggleAllCollapsed', () => {
    it('collapses all sections and instructions when some are expanded', () => {
      usePromptStore.setState({
        sections: [createSection({ id: 's1', collapsed: false }), createSection({ id: 's2', collapsed: true })],
        instructionsCollapsed: false,
      });

      act(() => usePromptStore.getState().toggleAllCollapsed());

      const state = usePromptStore.getState();
      expect(state.sections.every((s) => s.collapsed)).toBe(true);
      expect(state.instructionsCollapsed).toBe(true);
    });

    it('collapses all when only instructions is expanded', () => {
      usePromptStore.setState({
        sections: [createSection({ id: 's1', collapsed: true }), createSection({ id: 's2', collapsed: true })],
        instructionsCollapsed: false,
      });

      act(() => usePromptStore.getState().toggleAllCollapsed());

      const state = usePromptStore.getState();
      expect(state.sections.every((s) => s.collapsed)).toBe(true);
      expect(state.instructionsCollapsed).toBe(true);
    });

    it('expands all sections and instructions when all are collapsed', () => {
      usePromptStore.setState({
        sections: [createSection({ id: 's1', collapsed: true }), createSection({ id: 's2', collapsed: true })],
        instructionsCollapsed: true,
      });

      act(() => usePromptStore.getState().toggleAllCollapsed());

      const state = usePromptStore.getState();
      expect(state.sections.every((s) => !s.collapsed)).toBe(true);
      expect(state.instructionsCollapsed).toBe(false);
    });
  });

  describe('removeSection', () => {
    it('removes section and returns removed section result', () => {
      const section = createSection({ id: 's1' });
      usePromptStore.setState({ sections: [section] });

      let result: RemovedSectionResult | null = null;
      act(() => {
        result = usePromptStore.getState().removeSection('s1');
      });

      expect(result).toEqual({ section, index: 0 });
      expect(usePromptStore.getState().sections).toHaveLength(0);
    });

    it('returns null for non-existent section', () => {
      let result: RemovedSectionResult | null = null;
      act(() => {
        result = usePromptStore.getState().removeSection('non-existent');
      });

      expect(result).toBeNull();
    });
  });

  describe('restoreSection', () => {
    it('restores section at the specified index', () => {
      const section1 = createSection({ id: 's1' });
      const section2 = createSection({ id: 's2' });
      const removedSection = createSection({ id: 's-removed' });
      usePromptStore.setState({ sections: [section1, section2] });

      act(() => usePromptStore.getState().restoreSection(removedSection, 1));

      const sections = usePromptStore.getState().sections;
      expect(sections).toHaveLength(3);
      expect(sections[1].id).toBe('s-removed');
    });
  });

  describe('updateContent', () => {
    it('updates section content', () => {
      usePromptStore.setState({ sections: [createSection({ id: 's1', content: 'old' })] });

      act(() => usePromptStore.getState().updateContent('s1', 'new content'));

      expect(usePromptStore.getState().sections[0].content).toBe('new content');
    });
  });

  describe('updateTitle', () => {
    it('updates section title', () => {
      usePromptStore.setState({ sections: [createSection({ id: 's1', title: 'old' })] });

      act(() => usePromptStore.getState().updateTitle('s1', 'new title'));

      expect(usePromptStore.getState().sections[0].title).toBe('new title');
    });
  });

  describe('addSection', () => {
    it('adds a new section with generated id', () => {
      mockUUID.mockReturnValue('new-section-id');

      act(() => usePromptStore.getState().addSection({ title: 'New Section' }));

      const state = usePromptStore.getState();
      expect(state.sections).toHaveLength(1);
      expect(state.sections[0].id).toBe('new-section-id');
      expect(state.sections[0].title).toBe('New Section');
      expect(state.newSectionId).toBe('new-section-id');
    });

    it('adds section with default values when no initial data provided', () => {
      act(() => usePromptStore.getState().addSection());

      const section = usePromptStore.getState().sections[0];
      expect(section.title).toBe('');
      expect(section.content).toBe('');
      expect(section.enabled).toBe(true);
      expect(section.collapsed).toBe(false);
    });
  });

  describe('reorderSections', () => {
    it('reorders sections correctly', () => {
      usePromptStore.setState({
        sections: [
          createSection({ id: 's1', title: 'First' }),
          createSection({ id: 's2', title: 'Second' }),
          createSection({ id: 's3', title: 'Third' }),
        ],
      });

      act(() => usePromptStore.getState().reorderSections('s1', 's3'));

      const titles = usePromptStore.getState().sections.map((s) => s.title);
      expect(titles).toEqual(['Second', 'Third', 'First']);
    });

    it('handles non-existent ids gracefully', () => {
      const initialSections = [createSection({ id: 's1' })];
      usePromptStore.setState({ sections: initialSections });

      act(() => usePromptStore.getState().reorderSections('non-existent', 's1'));

      expect(usePromptStore.getState().sections).toEqual(initialSections);
    });
  });

  describe('setSections', () => {
    it('replaces all sections', () => {
      const newSections = [createSection({ id: 'new-s1' })];
      usePromptStore.setState({ sections: [createSection()], newSectionId: 'old-id' });

      act(() => usePromptStore.getState().setSections(newSections));

      expect(usePromptStore.getState().sections).toEqual(newSections);
      expect(usePromptStore.getState().newSectionId).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      usePromptStore.setState({
        promptId: 'test',
        promptTitle: 'Test',
        sections: [createSection()],
        newSectionId: 'new-id',
        instructions: 'Test instructions',
        instructionsCollapsed: true,
      });

      act(() => usePromptStore.getState().reset());

      const state = usePromptStore.getState();
      expect(state.promptId).toBeNull();
      expect(state.promptTitle).toBeUndefined();
      expect(state.sections).toEqual([]);
      expect(state.newSectionId).toBeNull();
      expect(state.instructions).toBe('');
      expect(state.instructionsCollapsed).toBe(false);
    });
  });

  describe('updateInstructions', () => {
    it('updates instructions content', () => {
      act(() => usePromptStore.getState().updateInstructions('New instructions'));
      expect(usePromptStore.getState().instructions).toBe('New instructions');
    });

    it('clears instructions when set to empty string', () => {
      usePromptStore.setState({ instructions: 'Existing' });
      act(() => usePromptStore.getState().updateInstructions(''));
      expect(usePromptStore.getState().instructions).toBe('');
    });
  });

  describe('toggleInstructionsCollapsed', () => {
    it('toggles instructions collapsed state from false to true', () => {
      usePromptStore.setState({ instructionsCollapsed: false });
      act(() => usePromptStore.getState().toggleInstructionsCollapsed());
      expect(usePromptStore.getState().instructionsCollapsed).toBe(true);
    });

    it('toggles instructions collapsed state from true to false', () => {
      usePromptStore.setState({ instructionsCollapsed: true });
      act(() => usePromptStore.getState().toggleInstructionsCollapsed());
      expect(usePromptStore.getState().instructionsCollapsed).toBe(false);
    });
  });

  describe('loadPrompt with instructions', () => {
    it('loads prompt with instructions from localStorage', () => {
      const promptId = 'test-prompt';
      const data = {
        title: 'Test Title',
        sections: [createSection()],
        instructions: 'Test instructions',
        instructionsCollapsed: true,
      };
      localStorage.setItem(STORAGE_KEYS.prompt(promptId), JSON.stringify(data));

      act(() => usePromptStore.getState().loadPrompt(promptId));

      const state = usePromptStore.getState();
      expect(state.instructions).toBe('Test instructions');
      expect(state.instructionsCollapsed).toBe(true);
    });

    it('defaults instructions to empty string when not in storage', () => {
      const promptId = 'test-prompt';
      const data = {
        title: 'Test Title',
        sections: [createSection()],
      };
      localStorage.setItem(STORAGE_KEYS.prompt(promptId), JSON.stringify(data));

      act(() => usePromptStore.getState().loadPrompt(promptId));

      const state = usePromptStore.getState();
      expect(state.instructions).toBe('');
      expect(state.instructionsCollapsed).toBe(false);
    });
  });
});
