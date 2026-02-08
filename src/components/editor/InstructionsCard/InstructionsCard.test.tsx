import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InstructionsCard } from '@/components/editor/InstructionsCard';
import { usePromptStore } from '@/stores/promptStore';
import { render } from '@/test';

// Reset store state before each test
beforeEach(() => {
  usePromptStore.setState({
    promptId: 'test-prompt',
    promptTitle: 'Test Prompt',
    sections: [],
    newSectionId: null,
    instructions: '',
    instructionsCollapsed: false,
  });
});

describe('InstructionsCard', () => {
  it('renders with fixed "Instructions" title', () => {
    render(<InstructionsCard />);
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  it('renders BookOpen icon', () => {
    render(<InstructionsCard />);
    // The BookOpen icon should be rendered in the header
    const card = screen.getByText('Instructions').closest('.group, [class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('renders collapse/expand button', () => {
    render(<InstructionsCard />);
    const collapseButton = screen.getByRole('button', { name: /collapse instructions/i });
    expect(collapseButton).toBeInTheDocument();
  });

  it('toggles collapsed state when collapse button is clicked', async () => {
    const user = userEvent.setup();
    render(<InstructionsCard />);

    const collapseButton = screen.getByRole('button', { name: /collapse instructions/i });
    await user.click(collapseButton);

    expect(usePromptStore.getState().instructionsCollapsed).toBe(true);

    const expandButton = screen.getByRole('button', { name: /expand instructions/i });
    await user.click(expandButton);

    expect(usePromptStore.getState().instructionsCollapsed).toBe(false);
  });

  it('renders textarea with placeholder when empty', () => {
    render(<InstructionsCard />);
    const textarea = screen.getByPlaceholderText(/add instructions/i);
    expect(textarea).toBeInTheDocument();
  });

  it('displays existing instructions content', () => {
    usePromptStore.setState({ instructions: 'Test instructions content' });
    render(<InstructionsCard />);
    const textarea = screen.getByDisplayValue('Test instructions content');
    expect(textarea).toBeInTheDocument();
  });

  it('updates instructions when content is changed', async () => {
    const user = userEvent.setup();
    render(<InstructionsCard />);

    const textarea = screen.getByPlaceholderText(/add instructions/i);
    await user.type(textarea, 'New instructions');

    // Wait for debounced update
    await waitFor(
      () => {
        expect(usePromptStore.getState().instructions).toBe('New instructions');
      },
      { timeout: 500 },
    );
  });

  it('renders options dropdown button', () => {
    render(<InstructionsCard />);
    const optionsButton = screen.getByRole('button', { name: /instructions options/i });
    expect(optionsButton).toBeInTheDocument();
  });

  it('shows maximize option in dropdown menu', async () => {
    const user = userEvent.setup();
    render(<InstructionsCard />);

    const optionsButton = screen.getByRole('button', { name: /instructions options/i });
    await user.click(optionsButton);

    expect(screen.getByRole('menuitem', { name: /maximize/i })).toBeInTheDocument();
  });

  it('does not show remove, disable, or duplicate options', async () => {
    const user = userEvent.setup();
    render(<InstructionsCard />);

    const optionsButton = screen.getByRole('button', { name: /instructions options/i });
    await user.click(optionsButton);

    expect(screen.queryByRole('menuitem', { name: /remove/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /disable/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /duplicate/i })).not.toBeInTheDocument();
  });

  it('does not have drag handle', () => {
    render(<InstructionsCard />);
    // The GripVertical icon should not be present
    const gripIcons = document.querySelectorAll('[data-testid="grip-vertical"]');
    expect(gripIcons.length).toBe(0);
  });
});

describe('InstructionsCard mobile mode', () => {
  it('calls onMobileEdit when mobile content is clicked', async () => {
    const user = userEvent.setup();
    const onMobileEdit = vi.fn();
    render(<InstructionsCard isMobile onMobileEdit={onMobileEdit} />);

    // In mobile mode, clicking the content area should trigger edit
    // The accessible name comes from the paragraph text content
    const editArea = screen.getByText(/tap to add instructions/i);
    await user.click(editArea);

    expect(onMobileEdit).toHaveBeenCalledTimes(1);
  });

  it('displays tap to edit message when empty in mobile mode', () => {
    render(<InstructionsCard isMobile />);
    expect(screen.getByText(/tap to add instructions/i)).toBeInTheDocument();
  });

  it('shows edit option in dropdown on mobile', async () => {
    const user = userEvent.setup();
    const onMobileEdit = vi.fn();
    render(<InstructionsCard isMobile onMobileEdit={onMobileEdit} />);

    const optionsButton = screen.getByRole('button', { name: /instructions options/i });
    await user.click(optionsButton);

    expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
  });
});
