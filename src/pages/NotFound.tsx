import { Trans, useLingui } from '@lingui/react/macro';
import { Home } from 'lucide-react';
import { Link } from 'react-router';

import { SEO } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

export default function NotFoundPage() {
  const { t } = useLingui();

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <SEO
        title={t`Page Not Found`}
        description={t`The page you're looking for doesn't exist or has been moved`}
        noIndex
      />
      <div
        className={cn(
          'glass-surface',
          'border-glass-border border',
          'ring-glass-ring ring-1 ring-inset',
          'shadow-glass-shadow shadow-2xl',
          'rounded-2xl',
          'relative flex flex-col items-center px-8 py-12 text-center',
          'transition-all duration-300 ease-out',
        )}
      >
        <div
          className="via-glass-glow pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
          aria-hidden="true"
        />
        <h1 className="text-foreground text-6xl font-bold">404</h1>
        <h2 className="text-muted-foreground mt-4 text-2xl">
          <Trans>Page Not Found</Trans>
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          <Trans>The page you&apos;re looking for doesn&apos;t exist or has been moved.</Trans>
        </p>
        <Button asChild className="mt-8">
          <Link to={ROUTES.HOME}>
            <Home className="mr-2 size-4" />
            <Trans>Back to Home</Trans>
          </Link>
        </Button>
      </div>
    </div>
  );
}
