import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SectionList } from '@/components/editor/SectionList';
import { usePromptStore } from '@/stores/promptStore';
import { render } from '@/test';
import type { Section } from '@/types';

// Mock sections for testing
const mockSections: Section[] = [
  {
    id: 'section-1',
    title: 'Test Section 1',
    content: 'Test content 1',
    enabled: true,
    collapsed: false,
  },
  {
    id: 'section-2',
    title: 'Test Section 2',
    content: 'Test content 2',
    enabled: true,
    collapsed: false,
  },
];

const mockCollapsedSections: Section[] = [
  {
    id: 'section-1',
    title: 'Test Section 1',
    content: 'Test content 1',
    enabled: true,
    collapsed: true,
  },
  {
    id: 'section-2',
    title: 'Test Section 2',
    content: 'Test content 2',
    enabled: true,
    collapsed: true,
  },
];

// Reset store state before each test
beforeEach(() => {
  usePromptStore.setState({
    promptId: 'test-prompt',
    promptTitle: 'Test Prompt',
    sections: mockSections,
    newSectionId: null,
    instructions: '',
    instructionsCollapsed: false,
  });
});

describe('SectionList Toolbar', () => {
  it('renders collapse/expand button with correct icon when sections are expanded', () => {
    render(<SectionList />);

    const collapseButton = screen.getByRole('button', { name: /collapse all/i });
    expect(collapseButton).toBeInTheDocument();

    // Check that the ChevronsDownUp icon is present (collapse icon)
    const icon = collapseButton.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders collapse/expand button with correct icon when sections are collapsed', () => {
    usePromptStore.setState({ sections: mockCollapsedSections, instructionsCollapsed: true });
    render(<SectionList />);

    const expandButton = screen.getByRole('button', { name: /expand all/i });
    expect(expandButton).toBeInTheDocument();

    // Check that the ChevronsUpDown icon is present (expand icon)
    const icon = expandButton.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('toggle changes icon between expand and collapse states', async () => {
    const user = userEvent.setup();
    render(<SectionList />);

    // Initially shows collapse button
    const collapseButton = screen.getByRole('button', { name: /collapse all/i });
    expect(collapseButton).toBeInTheDocument();

    // Click to collapse all
    await user.click(collapseButton);

    // Now should show expand button
    const expandButton = screen.getByRole('button', { name: /expand all/i });
    expect(expandButton).toBeInTheDocument();

    // Click to expand all
    await user.click(expandButton);

    // Should show collapse button again
    expect(screen.getByRole('button', { name: /collapse all/i })).toBeInTheDocument();
  });

  it('renders add section button with proper aria-label', () => {
    render(<SectionList />);

    const addButton = screen.getByRole('button', { name: /add section/i });
    expect(addButton).toBeInTheDocument();
  });

  it('all toolbar buttons have proper aria-labels', () => {
    render(<SectionList />);

    // Check all expected buttons exist with accessible names
    // Note: Copy button was moved to PromptPreview component
    expect(screen.getByRole('button', { name: /collapse all|expand all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
  });

  it('renders reset button when showReset is true', () => {
    const onReset = vi.fn();
    render(<SectionList showReset onReset={onReset} />);

    const resetButton = screen.getByRole('button', { name: /reset to original/i });
    expect(resetButton).toBeInTheDocument();
  });

  it('does not render reset button when showReset is false', () => {
    render(<SectionList />);

    const resetButton = screen.queryByRole('button', { name: /reset to original/i });
    expect(resetButton).not.toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<SectionList showReset onReset={onReset} />);

    const resetButton = screen.getByRole('button', { name: /reset to original/i });
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('adds a new section when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<SectionList />);

    const initialSectionCount = usePromptStore.getState().sections.length;

    const addButton = screen.getByRole('button', { name: /add section/i });
    await user.click(addButton);

    const newSectionCount = usePromptStore.getState().sections.length;
    expect(newSectionCount).toBe(initialSectionCount + 1);
  });
});

describe('SectionList Empty State', () => {
  it('renders toolbar and InstructionsCard when no sections exist', () => {
    usePromptStore.setState({ sections: [] });
    render(<SectionList />);

    // Toolbar should still be visible
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
    // InstructionsCard should be visible
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });
});

describe('SectionList Instructions', () => {
  it('renders InstructionsCard at the top of the list', () => {
    render(<SectionList />);

    // InstructionsCard should be present with its fixed title
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  it('renders InstructionsCard before section cards', () => {
    render(<SectionList />);

    const instructionsTitle = screen.getByText('Instructions');
    const firstSectionTitle = screen.getByText('Test Section 1');

    // Instructions should appear before the first section in the DOM order
    // compareDocumentPosition returns 4 if instructionsTitle precedes firstSectionTitle
    const position = instructionsTitle.compareDocumentPosition(firstSectionTitle);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('displays instructions content in InstructionsCard', () => {
    usePromptStore.setState({ instructions: 'Custom instructions text' });
    render(<SectionList />);

    expect(screen.getByDisplayValue('Custom instructions text')).toBeInTheDocument();
  });
});
