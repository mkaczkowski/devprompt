import { SignedIn } from '@clerk/react-router';
import { useLingui } from '@lingui/react/macro';
import { lazy, Suspense, useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router';

import { Header } from '@/components/layout';
import { ProfileSync, PromptSync, PWAUpdatePrompt, SEO } from '@/components/shared';
import { PageLoading } from '@/components/ui/loading';
import { SkipLink } from '@/components/ui/visually-hidden';
import { HeaderProvider } from '@/contexts';
import { useThemeEffect } from '@/hooks';
import { ROUTES } from '@/lib/routes';
import { lazySentryInit } from '@/lib/sentry';
import { toast } from '@/lib/toast';

// Lazy load pages for code splitting
const LibraryPage = lazy(() => import('@/pages/Library'));
const EditorPage = lazy(() => import('@/pages/Editor'));
const SharedPromptPage = lazy(() => import('@/pages/SharedPrompt'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

export default function App() {
  const { t } = useLingui();
  useThemeEffect();

  // Initialize Sentry lazily after app mounts
  useEffect(() => {
    lazySentryInit();
  }, []);

  const handleProfileSyncError = useCallback(
    (error: Error) => {
      toast.error(t`Failed to sync profile`, {
        description: error.message,
      });
    },
    [t],
  );

  return (
    <HeaderProvider>
      <PWAUpdatePrompt />
      <div className="bg-background text-foreground min-h-screen">
        <SEO description={t`Create, organize, and share structured AI prompts for your AI workflows`} />
        <SkipLink />
        <Header />
        {/* Sync Clerk user to Supabase when signed in */}
        <SignedIn>
          <ProfileSync onSyncError={handleProfileSyncError} />
          <PromptSync />
        </SignedIn>
        <main id="main">
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<LibraryPage />} />
              <Route path={ROUTES.EDITOR} element={<EditorPage />} />
              <Route path={ROUTES.SHARED_PROMPT} element={<SharedPromptPage />} />
              <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </HeaderProvider>
  );
}
