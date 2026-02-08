import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useIOSViewportReset, useSyncedState, useTouchSizes } from '@/hooks';

interface InstructionsEditDrawerProps {
  /** Current instructions content */
  content: string;
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the drawer requests to close */
  onOpenChange: (open: boolean) => void;
  /** Called when the instructions are saved */
  onSave: (content: string) => void;
}

/**
 * Full-screen drawer for editing instructions on mobile devices.
 */
export function InstructionsEditDrawer({ content, open, onOpenChange, onSave }: InstructionsEditDrawerProps) {
  const { t } = useLingui();
  const sizes = useTouchSizes();
  const handleBlur = useIOSViewportReset();

  // Use synced state to keep local state in sync with content
  // open=false (drawer closed) triggers sync when content changes
  const [localContent, setLocalContent] = useSyncedState(content, open);

  const handleSave = useCallback(() => {
    onSave(localContent);
    onOpenChange(false);
  }, [localContent, onSave, onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[95dvh]">
        <DrawerHeader>
          <DrawerTitle>{t`Edit Instructions`}</DrawerTitle>
          <VisuallyHidden>
            <DrawerDescription>{t`Edit instructions content`}</DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="flex flex-1 flex-col space-y-2">
            <label htmlFor="instructions-content" className="text-sm font-medium">
              {t`Content`}
            </label>
            <Textarea
              id="instructions-content"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={handleBlur}
              textareaSize="touch"
              placeholder={t`Add instructions for how the prompt should be used...`}
              className="min-h-[200px] flex-1 resize-none"
            />
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <DrawerClose asChild>
            <Button variant="outline" size={sizes.button} className="flex-1">
              {t`Cancel`}
            </Button>
          </DrawerClose>
          <Button size={sizes.button} onClick={handleSave} className="flex-1">
            {t`Save`}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
