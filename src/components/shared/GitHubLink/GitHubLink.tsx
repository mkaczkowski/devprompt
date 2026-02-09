import { useLingui } from '@lingui/react/macro';
import { Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useIsMobile, useTouchSizes } from '@/hooks';

const GITHUB_URL = 'https://github.com/mkaczkowski/devprompt';

export function GitHubLink() {
  const { t } = useLingui();
  const sizes = useTouchSizes();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <Button variant="ghost" size={sizes.iconButtonLg} asChild>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={t`GitHub repository`}>
        <Github className="size-5" />
      </a>
    </Button>
  );
}
