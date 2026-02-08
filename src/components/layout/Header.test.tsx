import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Header } from '@/components/layout/Header';
import { HeaderProvider } from '@/contexts';
import { render } from '@/test';

describe('Header', () => {
  it('renders the app title', () => {
    render(
      <HeaderProvider>
        <Header />
      </HeaderProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('DevPrompt')).toBeInTheDocument();
  });

  it('renders the theme toggle', () => {
    render(
      <HeaderProvider>
        <Header />
      </HeaderProvider>,
    );

    // ThemeToggle has an aria-label
    expect(screen.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(
      <HeaderProvider>
        <Header />
      </HeaderProvider>,
    );

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
