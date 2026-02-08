import { useLingui } from '@lingui/react/macro';
import { Cloud, Copy, Layers, Plus, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMobileContext } from '@/contexts/mobileContext';
import { useTouchSizes } from '@/hooks/useTouchSizes';
import { cn } from '@/lib/utils';

interface LibraryEmptyStateProps {
  isSearchResult?: boolean;
  onCreatePrompt: () => void;
}

interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  isMobile: boolean;
}

function FeatureItem({ icon: Icon, text, isMobile }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'bg-muted/50 border-border/50 flex shrink-0 items-center justify-center rounded-lg border',
          isMobile ? 'size-10' : 'size-8',
        )}
      >
        <Icon className={cn('text-muted-foreground', isMobile ? 'size-5' : 'size-4')} />
      </div>
      <span className="text-muted-foreground text-left text-sm">{text}</span>
    </div>
  );
}

export function LibraryEmptyState({ isSearchResult, onCreatePrompt }: LibraryEmptyStateProps) {
  const { t } = useLingui();
  const { isMobile } = useMobileContext();
  const sizes = useTouchSizes();

  // Search result empty state - minimal
  if (isSearchResult) {
    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center text-center">
        <p className="text-foreground text-sm font-medium">{t`No matching prompts`}</p>
        <p className="text-muted-foreground mt-1.5 text-xs md:text-sm">{t`Try adjusting your search query.`}</p>
      </div>
    );
  }

  // Initial empty state - onboarding
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center px-4 text-center">
      {/* Title */}
      <h2 className="text-foreground text-lg font-semibold tracking-tight">{t`Build Better AI Prompts`}</h2>

      {/* Subtitle */}
      <p className="text-muted-foreground mt-2 max-w-[280px] text-sm leading-relaxed">
        {t`Create, organize, and reuse structured prompts for AI assistants`}
      </p>

      {/* Feature list */}
      <div className="mt-5 flex max-w-sm flex-col gap-3 md:mt-6">
        <FeatureItem icon={Layers} text={t`Organize prompts into reusable sections`} isMobile={isMobile} />
        <FeatureItem icon={Copy} text={t`Copy full prompts or individual sections`} isMobile={isMobile} />
        <FeatureItem icon={Share2} text={t`Share prompts with others via unique links`} isMobile={isMobile} />
        <FeatureItem icon={Cloud} text={t`Sync across devices with cloud storage`} isMobile={isMobile} />
      </div>

      {/* CTA */}
      <Button size={sizes.buttonSm} onClick={onCreatePrompt} className="mt-6 gap-1.5 md:mt-8">
        <Plus className="size-4" />
        {t`Create First Prompt`}
      </Button>
    </div>
  );
}
