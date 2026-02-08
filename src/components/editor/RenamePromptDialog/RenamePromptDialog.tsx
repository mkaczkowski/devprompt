import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface RenamePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  placeholder?: string;
  onConfirm: (newValue: string) => void;
}

export function RenamePromptDialog({ open, onOpenChange, value, placeholder, onConfirm }: RenamePromptDialogProps) {
  const { t } = useLingui();
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync value when dialog opens (React recommended pattern: adjust state during render)
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setEditValue(value);
    }
  }

  // Auto-focus and select on open
  useEffect(() => {
    if (open) {
      // Delay to let the dialog animation complete
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleConfirm = useCallback(() => {
    if (editValue !== value) {
      onConfirm(editValue);
    }
    onOpenChange(false);
  }, [editValue, value, onConfirm, onOpenChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    },
    [handleConfirm],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t`Rename prompt`}</DialogTitle>
          <DialogDescription>{t`Enter a new name for your prompt.`}</DialogDescription>
        </DialogHeader>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={t`Prompt title`}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t`Cancel`}
          </Button>
          <Button onClick={handleConfirm}>{t`Save`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
