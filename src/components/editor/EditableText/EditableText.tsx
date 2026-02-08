import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useSyncedState } from '@/hooks';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  /** Current value to display/edit */
  value: string;
  /** Placeholder when value is empty */
  placeholder?: string;
  /** Called when editing is confirmed (Enter, blur) */
  onConfirm: (newValue: string) => void;
  /** Whether to start in edit mode immediately */
  startEditing?: boolean;
  /** Called after startEditing has been processed */
  onStartEditingHandled?: () => void;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Inline editable text component.
 * Click to enter edit mode, Enter or blur to confirm, Escape to cancel.
 */
export function EditableText({
  value,
  placeholder,
  onConfirm,
  startEditing = false,
  onStartEditingHandled,
  ariaLabel = 'text',
  className,
}: EditableTextProps) {
  const { t } = useLingui();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useSyncedState(value, isEditing);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle external trigger to start editing
  useEffect(() => {
    if (startEditing && !isEditing) {
      setEditValue(value);
      setIsEditing(true);
      onStartEditingHandled?.();
    }
  }, [startEditing, isEditing, value, setEditValue, onStartEditingHandled]);

  // Focus and select when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleConfirm = useCallback(() => {
    setIsEditing(false);
    if (editValue !== value) {
      onConfirm(editValue);
    }
  }, [editValue, value, onConfirm]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value, setEditValue]);

  const handleClick = useCallback(() => {
    setEditValue(value);
    setIsEditing(true);
  }, [value, setEditValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation(); // Prevent bubbling to parent (e.g., CollapsibleTrigger)

      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleConfirm, handleCancel],
  );

  const handleViewKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const displayValue = value || placeholder || '';

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleConfirm}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        variant="subtle"
        className={cn('h-auto py-0.5 text-base font-medium', className)}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <span
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleViewKeyDown}
      className={cn(
        'cursor-pointer rounded px-1 py-0.5 transition-colors duration-200 outline-none',
        'hover:bg-muted/50 focus-visible:ring-ring focus-visible:ring-1',
        'text-base font-medium',
        value ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
      aria-label={t`${ariaLabel}: ${displayValue}. Press Enter to edit.`}
    >
      {displayValue}
    </span>
  );
}
