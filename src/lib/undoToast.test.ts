import { describe, expect, it, vi } from 'vitest';

import { showUndoToast } from './undoToast';

vi.mock('@/lib/toast', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
  }),
}));

import { toast } from '@/lib/toast';

describe('showUndoToast', () => {
  it('calls toast with message and undo action', () => {
    const onUndo = vi.fn();
    showUndoToast('Item deleted', onUndo);

    expect(toast).toHaveBeenCalledWith(
      'Item deleted',
      expect.objectContaining({
        action: expect.objectContaining({ label: 'Undo' }),
        duration: 5000,
      }),
    );
  });

  it('uses custom undoLabel when provided', () => {
    showUndoToast('Deleted', vi.fn(), { undoLabel: 'Revert' });

    expect(toast).toHaveBeenCalledWith(
      'Deleted',
      expect.objectContaining({
        action: expect.objectContaining({ label: 'Revert' }),
      }),
    );
  });

  it('calls onUndo and shows success toast with undoneMessage on action click', () => {
    const onUndo = vi.fn();
    showUndoToast('Deleted', onUndo, { undoneMessage: 'Restored!' });

    const call = vi.mocked(toast).mock.calls.at(-1)!;
    const action = (call[1] as unknown as { action: { onClick: () => void } }).action;
    action.onClick();

    expect(onUndo).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Restored!');
  });

  it('calls onUndo without success toast when no undoneMessage', () => {
    const onUndo = vi.fn();
    showUndoToast('Deleted', onUndo);

    const call = vi.mocked(toast).mock.calls.at(-1)!;
    const action = (call[1] as unknown as { action: { onClick: () => void } }).action;
    vi.mocked(toast.success).mockClear();
    action.onClick();

    expect(onUndo).toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
