import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LibraryEmptyState } from '@/components/library/LibraryEmptyState';
import { render } from '@/test';

describe('LibraryEmptyState', () => {
  describe('Initial empty state (not search)', () => {
    it('renders the onboarding headline', () => {
      render(<LibraryEmptyState onCreatePrompt={vi.fn()} />);

      expect(screen.getByText('Build Better AI Prompts')).toBeInTheDocument();
    });

    it('displays subtitle explaining the app purpose', () => {
      render(<LibraryEmptyState onCreatePrompt={vi.fn()} />);

      expect(screen.getByText('Create, organize, and reuse structured prompts for AI assistants')).toBeInTheDocument();
    });

    it('displays feature items with key capabilities', () => {
      render(<LibraryEmptyState onCreatePrompt={vi.fn()} />);

      expect(screen.getByText('Organize prompts into reusable sections')).toBeInTheDocument();
      expect(screen.getByText('Copy full prompts or individual sections')).toBeInTheDocument();
      expect(screen.getByText('Share prompts with others via unique links')).toBeInTheDocument();
      expect(screen.getByText('Sync across devices with cloud storage')).toBeInTheDocument();
    });

    it('renders "Create First Prompt" button', () => {
      render(<LibraryEmptyState onCreatePrompt={vi.fn()} />);

      expect(screen.getByRole('button', { name: /create first prompt/i })).toBeInTheDocument();
    });

    it('calls onCreatePrompt when "Create First Prompt" button is clicked', async () => {
      const user = userEvent.setup();
      const onCreatePrompt = vi.fn();

      render(<LibraryEmptyState onCreatePrompt={onCreatePrompt} />);

      await user.click(screen.getByRole('button', { name: /create first prompt/i }));

      expect(onCreatePrompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search result empty state', () => {
    it('renders the no matching prompts message', () => {
      render(<LibraryEmptyState isSearchResult onCreatePrompt={vi.fn()} />);

      expect(screen.getByText('No matching prompts')).toBeInTheDocument();
    });

    it('displays hint to adjust search query', () => {
      render(<LibraryEmptyState isSearchResult onCreatePrompt={vi.fn()} />);

      expect(screen.getByText('Try adjusting your search query.')).toBeInTheDocument();
    });

    it('does not display feature items for search results', () => {
      render(<LibraryEmptyState isSearchResult onCreatePrompt={vi.fn()} />);

      expect(screen.queryByText('Organize prompts into reusable sections')).not.toBeInTheDocument();
    });

    it('does not render any buttons', () => {
      render(<LibraryEmptyState isSearchResult onCreatePrompt={vi.fn()} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
