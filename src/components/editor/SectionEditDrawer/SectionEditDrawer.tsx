import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useIOSViewportReset, useSyncedState, useTouchSizes } from '@/hooks';
import type { Section } from '@/types';

interface SectionEditDrawerProps {
  /** Section being edited, or null if closed */
  section: Section | null;
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the drawer requests to close */
  onOpenChange: (open: boolean) => void;
  /** Called when the section is saved */
  onSave: (id: string, title: string, content: string) => void;
}

/**
 * Full-screen drawer for editing sections on mobile devices.
 */
export function SectionEditDrawer({ section, open, onOpenChange, onSave }: SectionEditDrawerProps) {
  const { t } = useLingui();
  const sizes = useTouchSizes();
  const handleBlur = useIOSViewportReset();

  // Memoize initial values based on section
  const initialValues = useMemo(
    () => ({
      title: section?.title ?? '',
      content: section?.content ?? '',
    }),
    [section],
  );

  // Use synced state to keep local state in sync with section
  // open=false (drawer closed) triggers sync when section changes
  const [title, setTitle] = useSyncedState(initialValues.title, open);
  const [content, setContent] = useSyncedState(initialValues.content, open);

  const handleSave = useCallback(() => {
    if (section) {
      onSave(section.id, title, content);
      onOpenChange(false);
    }
  }, [section, title, content, onSave, onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[95dvh]">
        <DrawerHeader>
          <DrawerTitle>{t`Edit Section`}</DrawerTitle>
          <VisuallyHidden>
            <DrawerDescription>{t`Edit section title and content`}</DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <label htmlFor="section-title" className="text-sm font-medium">
              {t`Title`}
            </label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              inputSize="touch"
              placeholder={t`Section title`}
            />
          </div>

          <div className="flex flex-1 flex-col space-y-2">
            <label htmlFor="section-content" className="text-sm font-medium">
              {t`Content`}
            </label>
            <Textarea
              id="section-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              textareaSize="touch"
              placeholder={t`Enter your content here...`}
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
