import { useLingui } from '@lingui/react/macro';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTouchSizes } from '@/hooks';
import { usePreferencesStore } from '@/stores';

export function ThemeToggle() {
  const { t } = useLingui();
  const getResolvedTheme = usePreferencesStore((state) => state.getResolvedTheme);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const sizes = useTouchSizes();

  const resolvedTheme = getResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size={sizes.iconButtonLg}
      onClick={toggleTheme}
      aria-label={isDark ? t`Switch to light mode` : t`Switch to dark mode`}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
