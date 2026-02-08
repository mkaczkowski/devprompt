import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SectionMaximizeDialog } from './SectionMaximizeDialog';

import { render } from '@/test';
import type { Section } from '@/types';

const createSection = (overrides: Partial<Section> = {}): Section => ({
  id: 'test-section-1',
  title: 'Test Section',
  content: '# Hello World\n\nThis is **markdown** content.',
  enabled: true,
  collapsed: false,
  ...overrides,
});

describe('SectionMaximizeDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnContentChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    mockOnContentChange.mockClear();
  });

  it('renders section content when open', async () => {
    const user = userEvent.setup();
    const section = createSection();

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    // Use getAllByText since title appears in both sr-only header and visible header
    const titles = screen.getAllByText('Test Section');
    expect(titles.length).toBeGreaterThanOrEqual(1);

    // Switch to source view to verify content in textarea (rendered is default)
    const sourceTab = screen.getByRole('tab', { name: /source/i });
    await user.click(sourceTab);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue(section.content);
    });
  });

  it('does not render when closed', () => {
    const section = createSection();

    render(<SectionMaximizeDialog open={false} onOpenChange={mockOnOpenChange} section={section} />);

    expect(screen.queryByText('Test Section')).not.toBeInTheDocument();
  });

  it('displays fallback title for untitled sections', () => {
    const section = createSection({ title: '' });

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    // Use getAllByText since title appears in both sr-only header and visible header
    const titles = screen.getAllByText('Untitled Section');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state in rendered view for empty content', () => {
    const section = createSection({ content: '' });

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    // Rendered is the default view, empty state should be visible immediately
    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  it('shows empty state in rendered view for whitespace-only content', () => {
    const section = createSection({ content: '   \n\t  ' });

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    // Rendered is the default view, empty state should be visible immediately
    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  it('toggles between source and rendered views', async () => {
    const user = userEvent.setup();
    const section = createSection();

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    // Find the tab buttons
    const sourceTab = screen.getByRole('tab', { name: /source/i });
    const renderedTab = screen.getByRole('tab', { name: /rendered/i });

    // Rendered tab should initially be active (selected) - it's the default
    expect(renderedTab).toHaveAttribute('aria-selected', 'true');
    expect(sourceTab).toHaveAttribute('aria-selected', 'false');

    // Click source tab
    await user.click(sourceTab);

    // Now source tab should be active
    await waitFor(() => {
      expect(sourceTab).toHaveAttribute('aria-selected', 'true');
      expect(renderedTab).toHaveAttribute('aria-selected', 'false');
    });

    // Click rendered tab to go back to default
    await user.click(renderedTab);

    // Rendered tab should be active again
    await waitFor(() => {
      expect(renderedTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('copies content to clipboard', async () => {
    const user = userEvent.setup();
    const section = createSection({ content: 'Copy this content' });

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    const copyButton = screen.getByRole('button', { name: /copy content/i });
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('Copy this content');
  });

  it('disables copy button when content is empty', () => {
    const section = createSection({ content: '' });

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    const copyButton = screen.getByRole('button', { name: /copy content/i });
    expect(copyButton).toBeDisabled();
  });

  it('shows copy feedback after copying', async () => {
    const user = userEvent.setup();
    const section = createSection({ content: 'Test content' });

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    const copyButton = screen.getByRole('button', { name: /copy content/i });
    await user.click(copyButton);

    // Button should now show "Copied" state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    });
  });

  it('shows copy button with label', () => {
    const section = createSection();

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    // Copy button should have visible "Copy" label
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders separator between tabs and copy button', () => {
    const section = createSection();

    render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

    // Separator should be present
    const separator = document.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
  });

  describe('Editing', () => {
    it('allows editing content in source view', async () => {
      const user = userEvent.setup();
      const section = createSection({ content: 'Initial content' });

      render(
        <SectionMaximizeDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          section={section}
          onContentChange={mockOnContentChange}
        />,
      );

      // Switch to source view first (rendered is default)
      const sourceTab = screen.getByRole('tab', { name: /source/i });
      await user.click(sourceTab);

      const textarea = await screen.findByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'New content');

      expect(textarea).toHaveValue('New content');
    });

    it('saves content on close when changed', async () => {
      const user = userEvent.setup();
      const section = createSection({ content: 'Initial content' });

      render(
        <SectionMaximizeDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          section={section}
          onContentChange={mockOnContentChange}
        />,
      );

      // Switch to source view first (rendered is default)
      const sourceTab = screen.getByRole('tab', { name: /source/i });
      await user.click(sourceTab);

      const textarea = await screen.findByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'New content');

      // Close dialog with Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnContentChange).toHaveBeenCalledWith('New content');
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('does not save content on close when unchanged', async () => {
      const section = createSection({ content: 'Same content' });

      render(
        <SectionMaximizeDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          section={section}
          onContentChange={mockOnContentChange}
        />,
      );

      // Close dialog with Escape without editing
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
      expect(mockOnContentChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible name for copy button', () => {
      const section = createSection();

      render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

      expect(screen.getByRole('button', { name: /copy content/i })).toBeInTheDocument();
    });

    it('has accessible names for view toggle tabs', () => {
      const section = createSection();

      render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

      expect(screen.getByRole('tab', { name: /source/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /rendered/i })).toBeInTheDocument();
    });

    it('can close dialog with Escape key', async () => {
      const section = createSection();

      render(<SectionMaximizeDialog open={true} onOpenChange={mockOnOpenChange} section={section} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });
});
