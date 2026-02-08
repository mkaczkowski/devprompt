import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { render } from '@/test';

// Reset store state before each test
beforeEach(() => {
  usePreferencesStore.setState({ theme: 'light' });
});

describe('ThemeToggle', () => {
  it('renders a button', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has accessible label for light theme', () => {
    usePreferencesStore.setState({ theme: 'light' });
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/switch to dark mode/i);
  });

  it('has accessible label for dark theme', () => {
    usePreferencesStore.setState({ theme: 'dark' });
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/switch to light mode/i);
  });

  it('toggles theme when clicked', async () => {
    const user = userEvent.setup();
    usePreferencesStore.setState({ theme: 'light' });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    // After click, theme should be dark
    expect(usePreferencesStore.getState().theme).toBe('dark');
  });

  it('toggles from dark to light', async () => {
    const user = userEvent.setup();
    usePreferencesStore.setState({ theme: 'dark' });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(usePreferencesStore.getState().theme).toBe('light');
  });
});
