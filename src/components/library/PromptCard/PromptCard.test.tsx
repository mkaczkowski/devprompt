import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PromptCard } from './PromptCard';

import { render } from '@/test';
import type { PromptMetadata } from '@/types';

const createMockPrompt = (overrides: Partial<PromptMetadata> = {}): PromptMetadata => ({
  id: 'test-prompt-1',
  title: 'Test Prompt Title',
  createdAt: Date.now() - 86400000, // 1 day ago
  updatedAt: Date.now() - 3600000, // 1 hour ago
  sectionCount: 3,
  tokenCount: 1500,
  ...overrides,
});

const defaultProps = {
  onClick: vi.fn(),
  onCopyPrompt: vi.fn(),
  onDuplicate: vi.fn(),
  onDelete: vi.fn(),
  onExport: vi.fn(),
  canDelete: true,
};

describe('PromptCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders prompt title', () => {
      const prompt = createMockPrompt({ title: 'My Custom Prompt' });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('My Custom Prompt')).toBeInTheDocument();
    });

    it('displays section count', () => {
      const prompt = createMockPrompt({ sectionCount: 5 });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays singular section count for one section', () => {
      const prompt = createMockPrompt({ sectionCount: 1 });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('displays formatted token count', () => {
      const prompt = createMockPrompt({ tokenCount: 2500 });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('2.5k')).toBeInTheDocument();
    });

    it('displays relative time from updatedAt', () => {
      const prompt = createMockPrompt({ updatedAt: Date.now() - 3600000 }); // 1 hour ago
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText(/1h ago/)).toBeInTheDocument();
    });

    it('displays "Just now" for very recent updates', () => {
      const prompt = createMockPrompt({ updatedAt: Date.now() - 30000 }); // 30 seconds ago
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText(/Just now/)).toBeInTheDocument();
    });

    it('displays days ago for older updates', () => {
      const prompt = createMockPrompt({ updatedAt: Date.now() - 172800000 }); // 2 days ago
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText(/2d ago/)).toBeInTheDocument();
    });

    it('calls onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} onClick={onClick} />);

      await user.click(screen.getByRole('button', { name: /Test Prompt Title/i }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation with Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} onClick={onClick} />);

      const card = screen.getByRole('button', { name: /Test Prompt Title/i });
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation with Space', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} onClick={onClick} />);

      const card = screen.getByRole('button', { name: /Test Prompt Title/i });
      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('has hover-revealed menu container', () => {
      const prompt = createMockPrompt();
      const { container } = render(<PromptCard {...defaultProps} prompt={prompt} />);

      const menuWrapper = container.querySelector('.opacity-0.group-hover\\:opacity-100');
      expect(menuWrapper).toBeInTheDocument();
    });
  });

  describe('dropdown menu actions', () => {
    it('calls onCopyPrompt when copy prompt is clicked', async () => {
      const user = userEvent.setup();
      const onCopyPrompt = vi.fn();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} onCopyPrompt={onCopyPrompt} />);

      // Open dropdown
      const menuButton = screen.getByRole('button', { name: /prompt options/i });
      await user.click(menuButton);

      // Click copy
      const copyItem = screen.getByRole('menuitem', { name: /copy/i });
      await user.click(copyItem);

      expect(onCopyPrompt).toHaveBeenCalledTimes(1);
    });

    it('calls onDuplicate when duplicate is clicked', async () => {
      const user = userEvent.setup();
      const onDuplicate = vi.fn();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} onDuplicate={onDuplicate} />);

      // Open dropdown
      const menuButton = screen.getByRole('button', { name: /prompt options/i });
      await user.click(menuButton);

      // Click duplicate
      const duplicateItem = screen.getByRole('menuitem', { name: /duplicate/i });
      await user.click(duplicateItem);

      expect(onDuplicate).toHaveBeenCalledTimes(1);
    });

    it('calls onExport when export is clicked', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} onExport={onExport} />);

      // Open dropdown
      const menuButton = screen.getByRole('button', { name: /prompt options/i });
      await user.click(menuButton);

      // Click export
      const exportItem = screen.getByRole('menuitem', { name: /export/i });
      await user.click(exportItem);

      expect(onExport).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when delete is clicked and canDelete is true', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} onDelete={onDelete} canDelete />);

      // Open dropdown
      const menuButton = screen.getByRole('button', { name: /prompt options/i });
      await user.click(menuButton);

      // Click delete
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      await user.click(deleteItem);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('does not show delete option when canDelete is false', async () => {
      const user = userEvent.setup();
      const prompt = createMockPrompt();
      render(<PromptCard {...defaultProps} prompt={prompt} canDelete={false} />);

      // Open dropdown
      const menuButton = screen.getByRole('button', { name: /prompt options/i });
      await user.click(menuButton);

      // Delete should not be present
      expect(screen.queryByRole('menuitem', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero sections', () => {
      const prompt = createMockPrompt({ sectionCount: 0 });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles zero tokens', () => {
      const prompt = createMockPrompt({ tokenCount: 0 });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles undefined sectionCount', () => {
      const prompt = createMockPrompt({ sectionCount: undefined });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles undefined tokenCount', () => {
      const prompt = createMockPrompt({ tokenCount: undefined });
      render(<PromptCard {...defaultProps} prompt={prompt} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
