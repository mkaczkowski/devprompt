import { Trans } from '@lingui/react/macro';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackUIProps {
  error: Error | null;
  onRetry: () => void;
  onReload: () => void;
}

export function ErrorFallbackUI({ error, onRetry, onReload }: ErrorFallbackUIProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive size-5" />
            <CardTitle>
              <Trans>Something went wrong</Trans>
            </CardTitle>
          </div>
          <CardDescription>
            <Trans>An unexpected error occurred. You can try again or reload the page.</Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="glass-inner border-glass-inner-border rounded-md border p-3 shadow-inner">
              <p className="text-muted-foreground font-mono text-xs break-all md:text-sm">{error.message}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={onRetry} variant="default">
              <Trans>Try Again</Trans>
            </Button>
            <Button onClick={onReload} variant="outline">
              <RefreshCw className="mr-2 size-4" />
              <Trans>Reload Page</Trans>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
