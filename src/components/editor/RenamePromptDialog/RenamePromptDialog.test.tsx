import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RenamePromptDialog } from './RenamePromptDialog';

import { render } from '@/test';

describe('RenamePromptDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    value: 'My Prompt',
    placeholder: 'Untitled',
    onConfirm: vi.fn(),
  };

  it('should render dialog with current value', () => {
    render(<RenamePromptDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Prompt title')).toHaveValue('My Prompt');
  });

  it('should confirm with new value on Save click', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onConfirm = vi.fn();
    render(<RenamePromptDialog {...defaultProps} onConfirm={onConfirm} />);

    // Wait for auto-focus/select timer to complete
    vi.advanceTimersByTime(100);

    const input = screen.getByLabelText('Prompt title');
    await user.clear(input);
    await user.type(input, 'New Title');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onConfirm).toHaveBeenCalledWith('New Title');
    vi.useRealTimers();
  });

  it('should confirm on Enter key', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onConfirm = vi.fn();
    render(<RenamePromptDialog {...defaultProps} onConfirm={onConfirm} />);

    // Wait for auto-focus/select timer to complete
    vi.advanceTimersByTime(100);

    const input = screen.getByLabelText('Prompt title');
    await user.clear(input);
    await user.type(input, 'New Title{Enter}');

    expect(onConfirm).toHaveBeenCalledWith('New Title');
    vi.useRealTimers();
  });

  it('should close without confirming on Cancel click', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(<RenamePromptDialog {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not call onConfirm when value is unchanged', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<RenamePromptDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should auto-focus the input when opened', async () => {
    render(<RenamePromptDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Prompt title')).toHaveFocus();
    });
  });
});
