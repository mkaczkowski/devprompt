import { useLingui } from '@lingui/react/macro';
import { BookOpen, EllipsisVertical, Maximize2, Pencil } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { InstructionsMaximizeDialog } from './InstructionsMaximizeDialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedCallback, useSyncedState, useTouchSizes } from '@/hooks';
import { cn } from '@/lib/utils';
import { usePromptStore } from '@/stores/promptStore';

interface InstructionsCardProps {
  /** Called when the mobile edit drawer should open */
  onMobileEdit?: () => void;
  /** Whether to use mobile layout */
  isMobile?: boolean;
}

/**
 * Fixed instructions card that appears at the top of the section list.
 * Cannot be removed, disabled, or reordered. Visually distinct with primary accent.
 */
export function InstructionsCard({ onMobileEdit, isMobile = false }: InstructionsCardProps) {
  const { t } = useLingui();
  const sizes = useTouchSizes();

  // Use useShallow to prevent unnecessary re-renders when other store state changes
  const { instructions, instructionsCollapsed, updateInstructions, toggleInstructionsCollapsed } = usePromptStore(
    useShallow((state) => ({
      instructions: state.instructions,
      instructionsCollapsed: state.instructionsCollapsed,
      updateInstructions: state.updateInstructions,
      toggleInstructionsCollapsed: state.toggleInstructionsCollapsed,
    })),
  );

  // Use synced state to keep local content in sync with instructions
  const [editedContent, setEditedContent] = useSyncedState(instructions, false);
  const [maximizeDialogOpen, setMaximizeDialogOpen] = useState(false);

  // Debounced content update
  const debouncedUpdateContent = useDebouncedCallback((content: string) => {
    updateInstructions(content);
  }, 300);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setEditedContent(newContent);
      debouncedUpdateContent.call(newContent);
    },
    [setEditedContent, debouncedUpdateContent],
  );

  return (
    <>
      <Collapsible open={!instructionsCollapsed} onOpenChange={toggleInstructionsCollapsed}>
        <Card
          size="sm"
          className={cn(
            'border-border border ring-0',
            'shadow-glass-shadow shadow-sm',
            'transition-all duration-200 ease-out',
            'hover:border-border/80 hover:shadow-glass-shadow hover:shadow-md',
          )}
        >
          <CardHeader className="flex flex-row items-center gap-2.5">
            {/* Icon with subtle background */}
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md',
                'bg-muted/80 dark:bg-muted/60',
                'transition-colors duration-200',
              )}
            >
              <BookOpen className="text-muted-foreground size-3.5" />
            </div>

            {/* Fixed title - not editable */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-base font-medium">{t`Instructions`}</span>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size={sizes.iconButton}
                  aria-label={instructionsCollapsed ? t`Expand instructions` : t`Collapse instructions`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground aria-expanded:bg-transparent"
                >
                  <CollapsibleChevron />
                </Button>
              </CollapsibleTrigger>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size={sizes.iconButton}
                    aria-label={t`Instructions options`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <EllipsisVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isMobile && (
                    <DropdownMenuItem onClick={onMobileEdit}>
                      <Pencil className="mr-2 size-4" />
                      {t`Edit`}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setMaximizeDialogOpen(true)}>
                    <Maximize2 className="mr-2 size-4" />
                    {t`Maximize`}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
              {isMobile ? (
                <div
                  onClick={onMobileEdit}
                  className={cn(
                    'cursor-pointer rounded-lg p-3',
                    'bg-muted/50 dark:bg-muted/30',
                    'border-border/50 border',
                    'transition-colors duration-200',
                    'hover:bg-muted/70 hover:border-border/70',
                    'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none',
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onMobileEdit?.()}
                >
                  <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">
                    {instructions || t`Tap to add instructions...`}
                  </p>
                </div>
              ) : (
                <Textarea
                  value={editedContent}
                  onChange={handleContentChange}
                  placeholder={t`Add instructions for how the prompt should be used...`}
                  variant="subtle"
                  className="max-h-[400px] min-h-[80px] resize-y overflow-y-auto"
                />
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <InstructionsMaximizeDialog
        open={maximizeDialogOpen}
        onOpenChange={setMaximizeDialogOpen}
        content={instructions}
        onContentChange={updateInstructions}
      />
    </>
  );
}
