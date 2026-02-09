import { SignedIn } from '@clerk/react-router';
import { useLingui } from '@lingui/react/macro';
import { Cloud, CloudOff, Loader2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTouchSizes } from '@/hooks';
import { useProfile, useUpdateProfile } from '@/hooks/supabase';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

export function SyncToggle() {
  const { t } = useLingui();
  const { profile, isLoading: isProfileLoading, error: profileError } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const hasShownProfileError = useRef(false);
  const sizes = useTouchSizes();

  const syncEnabled = profile?.sync_enabled ?? false;
  const isLoading = isProfileLoading || isPending;
  const hasError = !!profileError;

  // Show toast when profile fetch fails
  useEffect(() => {
    if (profileError && !hasShownProfileError.current) {
      hasShownProfileError.current = true;
      toast.error(t`Failed to load sync status`, {
        description: profileError.message,
      });
    }
    if (!profileError) {
      hasShownProfileError.current = false;
    }
  }, [profileError, t]);

  const handleToggle = (pressed: boolean) => {
    updateProfile(
      { sync_enabled: pressed },
      {
        onSuccess: () => {
          if (pressed) {
            toast.success(t`Cloud sync enabled`);
          } else {
            toast.success(t`Cloud sync disabled`);
          }
        },
        onError: (error) => {
          toast.error(t`Failed to update cloud sync`, {
            description: error.message,
          });
        },
      },
    );
  };

  const getAriaLabel = () => {
    if (hasError) return t`Cloud sync error`;
    if (isLoading) return t`Loading sync status`;
    return syncEnabled ? t`Disable cloud sync` : t`Enable cloud sync`;
  };

  const getTooltipContent = () => {
    if (hasError) return t`Cloud sync unavailable`;
    return syncEnabled ? t`Cloud sync enabled` : t`Cloud sync disabled`;
  };

  const Icon = isLoading ? Loader2 : hasError ? TriangleAlert : syncEnabled ? Cloud : CloudOff;

  return (
    <SignedIn>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            variant="ghost"
            pressed={syncEnabled}
            onPressedChange={handleToggle}
            disabled={isLoading || hasError}
            size={sizes.toggle}
            aria-label={getAriaLabel()}
            className={cn(
              'text-muted-foreground data-[state=on]:text-primary',
              hasError && 'text-destructive hover:text-destructive',
            )}
          >
            <Icon className={cn('size-5', isLoading && 'animate-spin')} />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>{getTooltipContent()}</TooltipContent>
      </Tooltip>
      <Separator orientation="vertical" className="bg-muted-foreground/25 mr-0.5 h-4 w-px" />
    </SignedIn>
  );
}
