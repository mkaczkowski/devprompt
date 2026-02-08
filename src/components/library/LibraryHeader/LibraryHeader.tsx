import { Trans, useLingui } from '@lingui/react/macro';
import { ArrowDown10, ArrowDownAZ, ArrowUp01, ArrowUpAZ, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTouchSizes } from '@/hooks/useTouchSizes';
import type { SortDirection, SortOption } from '@/types';

interface LibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (direction: SortDirection) => void;
  onNewPrompt: () => void;
}

export function LibraryHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
  onNewPrompt,
}: LibraryHeaderProps) {
  const { t } = useLingui();
  const sizes = useTouchSizes();

  const toggleSortDirection = () => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex items-center gap-3 sm:justify-between">
      {/* Left: Search + Controls */}
      <div className="flex flex-1 items-center gap-2 sm:flex-initial">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-[300px] sm:min-w-[200px] sm:flex-initial">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder={t`Search prompts...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            inputSize={sizes.input}
          />
        </div>

        {/* Sort controls - hidden on mobile */}
        <div className="hidden items-center gap-2 sm:flex">
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[140px]" size={sizes.select}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom">
              <SelectItem value="name">
                <Trans>Name</Trans>
              </SelectItem>
              <SelectItem value="dateModified">
                <Trans>Date modified</Trans>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size={sizes.iconButton}
            onClick={toggleSortDirection}
            aria-label={t`Toggle sort direction`}
          >
            {sortBy === 'name' ? (
              sortDirection === 'asc' ? (
                <ArrowDownAZ className="size-4" />
              ) : (
                <ArrowUpAZ className="size-4" />
              )
            ) : sortDirection === 'desc' ? (
              <ArrowDown10 className="size-4" />
            ) : (
              <ArrowUp01 className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Right: New Prompt button */}
      <Button onClick={onNewPrompt} size={sizes.button} className="shrink-0" aria-label={t`New Prompt`}>
        <Plus className="size-4" />
        <Trans>New Prompt</Trans>
      </Button>
    </div>
  );
}
