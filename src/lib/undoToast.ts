import { toast } from '@/lib/toast';

/**
 * Show a toast with an undo action.
 * Note: undoLabel must be provided by caller with translated string from useLingui().
 */
export function showUndoToast(
  message: string,
  onUndo: () => void,
  options?: { undoneMessage?: string; undoLabel?: string },
): void {
  toast(message, {
    action: {
      label: options?.undoLabel ?? 'Undo',
      onClick: () => {
        onUndo();
        if (options?.undoneMessage) {
          toast.success(options.undoneMessage);
        }
      },
    },
    duration: 5000,
  });
}
