import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLingui } from '@lingui/react/macro';
import { Copy, EllipsisVertical, GripVertical, Maximize2, Pencil, Power, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SectionMaximizeDialog } from './SectionMaximizeDialog';

import { EditableText } from '@/components/editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedCallback, useSyncedState, useTouchSizes } from '@/hooks';
import { toast } from '@/lib/toast';
import { showUndoToast } from '@/lib/undoToast';
import { cn } from '@/lib/utils';
import { usePromptStore } from '@/stores/promptStore';
import type { Section } from '@/types';

interface SectionCardProps {
  section: Section;
  /** Whether this is a drag overlay item */
  isDragOverlay?: boolean;
  /** Whether to start editing title immediately (for new sections) */
  startEditingTitle?: boolean;
  /** Called when startEditingTitle has been handled */
  onStartEditingHandled?: () => void;
  /** Called when the mobile edit drawer should open */
  onMobileEdit?: (section: Section) => void;
  /** Whether to use mobile layout */
  isMobile?: boolean;
  /** Whether to show the drag handle (requires 2+ sections to reorder) */
  showDragHandle?: boolean;
}

/**
 * Individual section card with drag handle, collapsible content, and inline editing.
 */
export function SectionCard({
  section,
  isDragOverlay = false,
  startEditingTitle = false,
  onStartEditingHandled,
  onMobileEdit,
  isMobile = false,
  showDragHandle = true,
}: SectionCardProps) {
  const { t } = useLingui();
  const sizes = useTouchSizes();
  // Use synced state to keep local content in sync with section content
  // isActive=false means we always sync (the actual input focus state handles user editing)
  const [editedContent, setEditedContent] = useSyncedState(section.content, false);
  const [maximizeDialogOpen, setMaximizeDialogOpen] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view when this is a newly added/duplicated section
  useEffect(() => {
    if (startEditingTitle && cardRef.current?.scrollIntoView) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [startEditingTitle]);

  const {
    toggleEnabled,
    toggleCollapsed,
    removeSection,
    restoreSection,
    updateContent,
    updateTitle,
    duplicateSection,
  } = usePromptStore();

  // Sortable hook for drag and drop
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Debounced content update
  const debouncedUpdateContent = useDebouncedCallback((content: string) => {
    updateContent(section.id, content);
  }, 300);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setEditedContent(newContent);
      debouncedUpdateContent.call(newContent);
    },
    [setEditedContent, debouncedUpdateContent],
  );

  const handleTitleConfirm = useCallback(
    (newTitle: string) => {
      updateTitle(section.id, newTitle);
    },
    [section.id, updateTitle],
  );

  const handleToggleEnabled = useCallback(() => {
    const willBeEnabled = !section.enabled;
    toggleEnabled(section.id);
    toast.success(willBeEnabled ? t`Section enabled` : t`Section disabled`);
  }, [section.id, section.enabled, toggleEnabled, t]);

  const handleRemove = useCallback(() => {
    const result = removeSection(section.id);
    if (result) {
      showUndoToast(t`Section removed`, () => restoreSection(result.section, result.index), {
        undoneMessage: t`Section restored`,
        undoLabel: t`Undo`,
      });
    }
  }, [section.id, removeSection, restoreSection, t]);

  const handleMobileEdit = useCallback(() => {
    onMobileEdit?.(section);
  }, [section, onMobileEdit]);

  const handleDuplicate = useCallback(() => {
    duplicateSection(section.id);
    toast.success(t`Section duplicated`);
  }, [section.id, duplicateSection, t]);

  // Combine sortable ref with our card ref
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [setNodeRef],
  );

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn(isDragging && 'opacity-50', isDragOverlay && 'rotate-1 shadow-2xl')}
    >
      <Collapsible open={!section.collapsed} onOpenChange={() => toggleCollapsed(section.id)}>
        <Card
          size="sm"
          className={cn(
            'border-border border ring-0',
            'shadow-glass-shadow shadow-sm',
            'transition-all duration-200 ease-out',
            'hover:border-border/80 hover:shadow-glass-shadow hover:shadow-md',
            !section.enabled && 'opacity-50',
          )}
        >
          <CardHeader className="flex flex-row items-center gap-2">
            {/* Drag handle - only visible when there are 2+ sections to reorder */}
            {showDragHandle && (
              <div {...attributes} {...listeners} className="shrink-0 cursor-grab touch-none active:cursor-grabbing">
                <GripVertical className="text-muted-foreground size-4" />
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <EditableText
                value={section.title}
                placeholder={t`Section title`}
                onConfirm={handleTitleConfirm}
                startEditing={startEditingTitle}
                onStartEditingHandled={onStartEditingHandled}
                ariaLabel={t`Section title`}
              />
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size={sizes.iconButton}
                  aria-label={section.collapsed ? t`Expand section` : t`Collapse section`}
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
                    aria-label={t`Section options`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <EllipsisVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isMobile && (
                    <>
                      <DropdownMenuItem onClick={handleMobileEdit}>
                        <Pencil className="mr-2 size-4" />
                        {t`Edit`}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 size-4" />
                    {t`Duplicate`}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMaximizeDialogOpen(true)}>
                    <Maximize2 className="mr-2 size-4" />
                    {t`Maximize`}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleEnabled}>
                    <Power className="mr-2 size-4" />
                    {section.enabled ? t`Disable` : t`Enable`}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleRemove}>
                    <Trash2 className="mr-2 size-4" />
                    {t`Remove`}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
              {isMobile ? (
                <div
                  onClick={handleMobileEdit}
                  className="glass-inner border-glass-inner-border cursor-pointer rounded-md border p-3 shadow-inner transition-colors duration-200"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleMobileEdit()}
                >
                  <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">
                    {section.content || t`Tap to edit...`}
                  </p>
                </div>
              ) : (
                <Textarea
                  ref={contentRef}
                  value={editedContent}
                  onChange={handleContentChange}
                  placeholder={t`Enter section content...`}
                  variant="subtle"
                  className="max-h-[600px] min-h-[100px] resize-y overflow-y-auto"
                />
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <SectionMaximizeDialog
        open={maximizeDialogOpen}
        onOpenChange={setMaximizeDialogOpen}
        section={section}
        onContentChange={(content) => updateContent(section.id, content)}
      />
    </div>
  );
}
