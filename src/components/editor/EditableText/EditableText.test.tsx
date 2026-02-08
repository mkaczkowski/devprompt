import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EditableText } from './EditableText';

import { render } from '@/test';

describe('EditableText', () => {
  const defaultProps = {
    value: '',
    placeholder: 'Enter text',
    onConfirm: vi.fn(),
  };

  describe('styling', () => {
    it('should have foreground color when value is present', () => {
      render(<EditableText {...defaultProps} value="My Title" />);

      const element = screen.getByRole('button');
      expect(element).toHaveClass('text-foreground');
      expect(element).not.toHaveClass('text-muted-foreground');
    });

    it('should have muted color when value is empty (placeholder shown)', () => {
      render(<EditableText {...defaultProps} value="" />);

      const element = screen.getByRole('button');
      expect(element).toHaveClass('text-muted-foreground');
      expect(element).not.toHaveClass('text-foreground');
    });

    it('should have title styling (font-medium, text-base)', () => {
      render(<EditableText {...defaultProps} value="My Title" />);

      const element = screen.getByRole('button');
      expect(element).toHaveClass('text-base');
      expect(element).toHaveClass('font-medium');
    });
  });

  describe('edit mode', () => {
    it('should enter edit mode on click', async () => {
      const user = userEvent.setup();
      render(<EditableText {...defaultProps} value="Test" />);

      const element = screen.getByRole('button');
      await user.click(element);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should confirm on Enter key', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<EditableText {...defaultProps} value="Test" onConfirm={onConfirm} />);

      const element = screen.getByRole('button');
      await user.click(element);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Value{Enter}');

      expect(onConfirm).toHaveBeenCalledWith('New Value');
    });

    it('should cancel on Escape key', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<EditableText {...defaultProps} value="Test" onConfirm={onConfirm} />);

      const element = screen.getByRole('button');
      await user.click(element);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Value{Escape}');

      expect(onConfirm).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).toHaveTextContent('Test');
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible with Enter to start editing', async () => {
      const user = userEvent.setup();
      render(<EditableText {...defaultProps} value="Test" />);

      const element = screen.getByRole('button');
      element.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should be keyboard accessible with Space to start editing', async () => {
      const user = userEvent.setup();
      render(<EditableText {...defaultProps} value="Test" />);

      const element = screen.getByRole('button');
      element.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
