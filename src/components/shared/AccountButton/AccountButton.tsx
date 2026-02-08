import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from '@clerk/react-router';
import { Trans, useLingui } from '@lingui/react/macro';
import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTouchSizes } from '@/hooks';

export function AccountButton() {
  const { t } = useLingui();
  const { isLoaded } = useAuth();
  const sizes = useTouchSizes();

  // Show skeleton while Clerk loads to prevent UI flash
  if (!isLoaded) {
    return <Skeleton className="size-9 rounded-full" />;
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size={sizes.iconButtonLg} aria-label={t`Sign in`}>
            <User className="size-5" />
            <span className="sr-only">
              <Trans>Sign in</Trans>
            </span>
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
