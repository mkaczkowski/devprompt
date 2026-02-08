import { useLingui } from '@lingui/react/macro';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { RenamePromptDialog } from '@/components/editor';
import { Logo } from '@/components/layout/Logo';
import { AccountButton, SyncToggle, ThemeToggle } from '@/components/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useHeaderContext } from '@/contexts';
import { ROUTES } from '@/lib/routes';

export function Header() {
  const { t } = useLingui();
  const location = useLocation();
  const { promptTitle, onTitleChange, isEditorView } = useHeaderContext();
  const isSubPage = location.pathname !== ROUTES.HOME;
  const [renameOpen, setRenameOpen] = useState(false);
  return (
    <header className="relative">
      {/* Bottom gradient glow separator */}
      <div
        className="via-glass-glow/60 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
        <h1 className="flex min-w-0 items-center text-lg font-semibold">
          {isSubPage ? (
            <Link
              to={ROUTES.HOME}
              className="hover:text-foreground/80 flex shrink-0 items-center gap-2.5 no-underline transition-colors duration-200"
              aria-label={t`Navigate to home`}
            >
              <Logo size={24} />
              DevPrompt
            </Link>
          ) : (
            <span className="flex shrink-0 items-center gap-2.5">
              <Logo size={24} />
              DevPrompt
            </span>
          )}
          {isEditorView && promptTitle !== undefined && (
            <>
              <span className="text-muted-foreground mr-1 ml-2.5 font-normal">/</span>
              {onTitleChange ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        role="button"
                        onClick={() => setRenameOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setRenameOpen(true);
                          }
                        }}
                        className="group hover:bg-muted/50 focus-visible:ring-ring flex min-w-0 cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition-colors duration-200 outline-none focus-visible:ring-1"
                        aria-label={t`Prompt title: ${promptTitle}. Press Enter to rename.`}
                      >
                        <span className="text-muted-foreground max-w-[200px] min-w-0 truncate font-normal sm:max-w-[300px] md:max-w-[400px]">
                          {promptTitle}
                        </span>
                        <Pencil className="text-muted-foreground/50 size-3 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t`Click to rename`}</p>
                    </TooltipContent>
                  </Tooltip>
                  <RenamePromptDialog
                    open={renameOpen}
                    onOpenChange={setRenameOpen}
                    value={promptTitle}
                    placeholder={t`Untitled`}
                    onConfirm={onTitleChange}
                  />
                </>
              ) : (
                <span className="text-muted-foreground max-w-[200px] min-w-0 truncate font-normal sm:max-w-[300px] md:max-w-[400px]">
                  {promptTitle}
                </span>
              )}
            </>
          )}
        </h1>
        <div className="flex items-center gap-2">
          {/* Cloud sync toggle - only for signed in users */}
          <SyncToggle />
          <ThemeToggle />
          {/* Account button - sign in/out */}
          <AccountButton />
        </div>
      </div>
    </header>
  );
}
