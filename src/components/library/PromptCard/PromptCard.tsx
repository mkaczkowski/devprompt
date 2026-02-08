import { Trans, useLingui } from '@lingui/react/macro';
import { Braces, ClipboardCopy, Copy, Download, Layers, Link2, Link2Off, MoreVertical, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCompactNumber, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PromptMetadata } from '@/types';

interface PromptCardProps {
  prompt: PromptMetadata;
  onClick: () => void;
  onCopyPrompt: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  canDelete: boolean;
  /** Whether share functionality is available (sync enabled) */
  canShare?: boolean;
  /** Whether this prompt is currently shared */
  isShared?: boolean;
  /** Called when user wants to share the prompt */
  onShare?: () => void;
  /** Called when user wants to unshare the prompt */
  onUnshare?: () => void;
  /** Called when user wants to copy the share link */
  onCopyShareLink?: () => void;
}

export function PromptCard({
  prompt,
  onClick,
  onCopyPrompt,
  onDuplicate,
  onDelete,
  onExport,
  canDelete,
  canShare = false,
  isShared = false,
  onShare,
  onUnshare,
  onCopyShareLink,
}: PromptCardProps) {
  const { t } = useLingui();

  const sectionCount = prompt.sectionCount ?? 0;
  const tokenCount = prompt.tokenCount ?? 0;

  const metadata = (
    <div className="text-muted-foreground flex items-center gap-1.5 text-xs md:text-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center gap-1"
            aria-label={t`Last updated ${formatRelativeTime(prompt.updatedAt)}`}
          >
            {formatRelativeTime(prompt.updatedAt)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <Trans>Last updated</Trans>
        </TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground/50">·</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1" aria-label={t`${formatCompactNumber(tokenCount)} tokens`}>
            <Braces className="size-3" aria-hidden="true" />
            {formatCompactNumber(tokenCount)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {formatCompactNumber(tokenCount)} {t`tokens`}
        </TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground/50">·</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center gap-1"
            aria-label={sectionCount === 1 ? t`1 section` : t`${sectionCount} sections`}
          >
            <Layers className="size-3" aria-hidden="true" />
            {sectionCount}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {sectionCount} {sectionCount === 1 ? t`section` : t`sections`}
        </TooltipContent>
      </Tooltip>
      {isShared && (
        <>
          <span className="text-muted-foreground/50">·</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1">
                <Link2 className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{t`Shared`}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <Trans>Shared</Trans>
            </TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );

  const dropdownMenu = (
    <div
      className={cn(
        'transition-opacity duration-200',
        'opacity-0 group-hover:opacity-100 has-[[data-state=open]]:opacity-100 max-md:opacity-100',
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()} aria-label={t`Prompt options`}>
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[148px]">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCopyPrompt();
            }}
          >
            <ClipboardCopy className="mr-2 size-4" />
            <Trans>Copy</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="mr-2 size-4" />
            <Trans>Duplicate</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onExport();
            }}
          >
            <Download className="mr-2 size-4" />
            <Trans>Export</Trans>
          </DropdownMenuItem>

          {/* Share actions - only show when canShare is true */}
          {canShare && (
            <>
              <DropdownMenuSeparator />
              {isShared ? (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyShareLink?.();
                    }}
                  >
                    <Link2 className="mr-2 size-4" />
                    <Trans>Copy link</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnshare?.();
                    }}
                  >
                    <Link2Off className="mr-2 size-4" />
                    <Trans>Stop sharing</Trans>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.();
                  }}
                >
                  <Link2 className="mr-2 size-4" />
                  <Trans>Share</Trans>
                </DropdownMenuItem>
              )}
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="mr-2 size-4" />
                <Trans>Delete</Trans>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-1.5 rounded-xl p-4',
        'bg-card border-border border',
        'shadow-glass-shadow shadow-sm',
        'cursor-pointer transition-all duration-200 ease-out',
        'hover:border-border/80 hover:shadow-glass-shadow hover:shadow-md',
        'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none',
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={prompt.title}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex-1 truncate text-base font-medium">{prompt.title}</h3>
        {dropdownMenu}
      </div>

      {/* Metadata row */}
      {metadata}
    </div>
  );
}
