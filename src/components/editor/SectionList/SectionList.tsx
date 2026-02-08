import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLingui } from '@lingui/react/macro';
import { ChevronsDownUp, ChevronsUpDown, Plus, RotateCcw, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  EmptyState,
  InstructionsCard,
  InstructionsEditDrawer,
  SectionCard,
  SectionEditDrawer,
} from '@/components/editor';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFileDrop, useTouchSizes } from '@/hooks';
import { areAllCollapsed, findSectionById } from '@/lib/sectionUtils';
import { usePromptStore } from '@/stores/promptStore';
import type { Section } from '@/types';

/** Minimum distance in pixels before drag starts */
const DRAG_ACTIVATION_DISTANCE = 8;

interface SectionListProps {
  /** Whether to use mobile layout */
  isMobile?: boolean;
  /** Called when reset button is clicked (only shown for premade prompts) */
  onReset?: () => void;
  /** Whether reset button should be shown */
  showReset?: boolean;
}

/**
 * Section list with drag-and-drop reordering, toolbar, and empty state.
 */
export function SectionList({ isMobile = false, onReset, showReset = false }: SectionListProps) {
  const { t } = useLingui();
  const sizes = useTouchSizes();

  // Store state - use useShallow to prevent unnecessary re-renders
  const { sections, newSectionId } = usePromptStore(
    useShallow((state) => ({
      sections: state.sections,
      newSectionId: state.newSectionId,
    })),
  );

  // Store actions - grouped with useShallow for cleaner code
  const { addSection, reorderSections, toggleAllCollapsed, updateContent, updateTitle } = usePromptStore(
    useShallow((state) => ({
      addSection: state.addSection,
      reorderSections: state.reorderSections,
      toggleAllCollapsed: state.toggleAllCollapsed,
      updateContent: state.updateContent,
      updateTitle: state.updateTitle,
    })),
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [handledNewSectionId, setHandledNewSectionId] = useState<string | null>(null);
  const [mobileEditSection, setMobileEditSection] = useState<Section | null>(null);
  const [mobileEditInstructionsOpen, setMobileEditInstructionsOpen] = useState(false);

  // Instructions state and actions - use useShallow for consistency
  const { instructions, instructionsCollapsed, updateInstructions } = usePromptStore(
    useShallow((state) => ({
      instructions: state.instructions,
      instructionsCollapsed: state.instructionsCollapsed,
      updateInstructions: state.updateInstructions,
    })),
  );

  // File drop handler — creates a new section for each dropped file
  const handleFilesDropped = useCallback(
    (files: { title: string; content: string }[]) => {
      for (const file of files) {
        addSection({ title: file.title, content: file.content });
      }
    },
    [addSection],
  );

  const { isDragging, dragHandlers, openFilePicker, inputProps } = useFileDrop({
    onFiles: handleFilesDropped,
  });

  // Drag sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);

      if (over && active.id !== over.id) {
        reorderSections(String(active.id), String(over.id));
      }
    },
    [reorderSections],
  );

  const handleAddSection = useCallback(() => {
    addSection();
  }, [addSection]);

  const handleStartEditingHandled = useCallback(() => {
    setHandledNewSectionId(newSectionId);
  }, [newSectionId]);

  const handleMobileEdit = useCallback((section: Section) => {
    setMobileEditSection(section);
  }, []);

  const handleMobileSave = useCallback(
    (id: string, title: string, content: string) => {
      updateTitle(id, title);
      updateContent(id, content);
    },
    [updateTitle, updateContent],
  );

  const handleMobileInstructionsEdit = useCallback(() => {
    setMobileEditInstructionsOpen(true);
  }, []);

  const allSectionsCollapsed = areAllCollapsed(sections);
  const allCollapsed = (sections.length === 0 || allSectionsCollapsed) && instructionsCollapsed;
  const activeDragSection = activeDragId ? findSectionById(sections, activeDragId) : null;

  // Full-area drag overlay shown when files are being dragged over
  const dragOverlay = isDragging && (
    <EmptyState
      icon={Upload}
      title={t`Drop text files to create sections`}
      description={t`Supports .txt, .md, .json, .csv`}
      className="bg-background/60 absolute inset-0 z-20 rounded-none backdrop-blur-xl"
    />
  );

  // Hidden file input
  const fileInput = <input {...inputProps} />;

  return (
    <div className="flex h-full flex-col">
      {fileInput}

      {/* Toolbar */}
      <div className="from-muted/60 dark:from-glass-subtle bg-gradient-to-b to-transparent px-4 py-[14px] sm:px-6 sm:py-[18px]">
        <div className="flex items-center gap-2">
          {/* Left: Reset button (if premade) + Add section */}
          <div className="flex shrink-0 items-center gap-1">
            {showReset && onReset && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size={sizes.iconButton} onClick={onReset} aria-label={t`Reset to original`}>
                    <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t`Reset to original`}</TooltipContent>
              </Tooltip>
            )}
            <Button variant="outline" size={sizes.button} onClick={handleAddSection} aria-label={t`Add section`}>
              <Plus className="size-4" />
              <span>{t`New Section`}</span>
            </Button>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size={sizes.iconButton} onClick={openFilePicker} aria-label={t`Import from file`}>
                <Upload className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t`Import from file`}</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Right: Collapse/Expand */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={sizes.iconButton}
                onClick={toggleAllCollapsed}
                aria-label={allCollapsed ? t`Expand all` : t`Collapse all`}
                className="shrink-0"
              >
                {allCollapsed ? <ChevronsUpDown className="size-4" /> : <ChevronsDownUp className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{allCollapsed ? t`Expand all` : t`Collapse all`}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Section List */}
      <div className="relative flex-1 overflow-y-auto px-4 pt-[2px] pb-8 sm:px-6" {...dragHandlers}>
        {dragOverlay}

        {/* Fixed Instructions Card - not part of sortable context */}
        <div className="mb-4">
          <InstructionsCard isMobile={isMobile} onMobileEdit={handleMobileInstructionsEdit} />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  startEditingTitle={section.id === newSectionId && section.id !== handledNewSectionId}
                  onStartEditingHandled={handleStartEditingHandled}
                  onMobileEdit={handleMobileEdit}
                  isMobile={isMobile}
                  showDragHandle={sections.length > 1}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeDragSection && (
              <SectionCard section={activeDragSection} isDragOverlay isMobile={isMobile} showDragHandle />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Mobile Edit Drawers */}
      {isMobile && (
        <>
          <SectionEditDrawer
            section={mobileEditSection}
            open={mobileEditSection !== null}
            onOpenChange={(open) => !open && setMobileEditSection(null)}
            onSave={handleMobileSave}
          />
          <InstructionsEditDrawer
            content={instructions}
            open={mobileEditInstructionsOpen}
            onOpenChange={setMobileEditInstructionsOpen}
            onSave={updateInstructions}
          />
        </>
      )}
    </div>
  );
}
