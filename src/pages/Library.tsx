import { useLingui } from '@lingui/react/macro';

import { PromptLibrary } from '@/components/library';
import { SEO } from '@/components/shared';
import { useDocumentTitle } from '@/hooks';

export default function LibraryPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Prompt Library`);

  return (
    <div className="bg-background flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <SEO title={t`Prompt Library`} description={t`Browse, manage, and organize your AI prompts`} />
      <PromptLibrary />
    </div>
  );
}
