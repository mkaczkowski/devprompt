import { useUser } from '@clerk/react-router';
import { useEffect, useRef } from 'react';

import { useCurrentProfile, useUpsertProfile } from '@/hooks';

interface ProfileSyncProps {
  /** Called on successful sync */
  onSyncComplete?: () => void;
  /** Called on sync failure */
  onSyncError?: (error: Error) => void;
}

/** Syncs Clerk user data to Supabase profiles table. Renders nothing. */
export function ProfileSync({ onSyncComplete, onSyncError }: ProfileSyncProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: profiles, isLoading: isProfileLoading } = useCurrentProfile();
  const { mutate: upsertProfile } = useUpsertProfile();

  const hasAttempted = useRef(false);
  const isSyncing = useRef(false);

  useEffect(() => {
    if (hasAttempted.current || isSyncing.current) return;
    if (!isUserLoaded || !user) return;
    if (isProfileLoading) return;

    const existingProfile = profiles?.[0];
    const needsSync = !existingProfile || existingProfile.email !== user.primaryEmailAddress?.emailAddress;

    if (!needsSync) {
      hasAttempted.current = true;
      return;
    }

    isSyncing.current = true;
    hasAttempted.current = true;

    upsertProfile(
      {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? '',
        full_name: user.fullName ?? null,
        avatar_url: user.imageUrl ?? null,
      },
      {
        onSuccess: () => {
          isSyncing.current = false;
          onSyncComplete?.();
        },
        onError: (error) => {
          isSyncing.current = false;
          onSyncError?.(new Error(error.message));
        },
      },
    );
  }, [isUserLoaded, user, profiles, isProfileLoading, upsertProfile, onSyncComplete, onSyncError]);

  return null;
}
