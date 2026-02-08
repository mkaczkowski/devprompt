import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SyntaxHighlightedTextarea } from './SyntaxHighlightedTextarea';

import { render } from '@/test';

describe('SyntaxHighlightedTextarea', () => {
  it('renders textarea with highlighted code backdrop', () => {
    const { container } = render(
      <SyntaxHighlightedTextarea value="const x = 1;" language="javascript" onChange={() => {}} />,
    );

    // Textarea has correct value
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('const x = 1;');

    // Backdrop contains highlighted code
    const codeElement = container.querySelector('code.hljs');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement?.innerHTML).toContain('hljs-keyword');
  });

  it('updates highlighting when language changes', () => {
    const { container, rerender } = render(
      <SyntaxHighlightedTextarea value="<div>test</div>" language="xml" onChange={() => {}} />,
    );

    expect(container.querySelector('code.hljs')?.innerHTML).toContain('hljs-tag');

    rerender(<SyntaxHighlightedTextarea value="## Header" language="markdown" onChange={() => {}} />);

    expect(container.querySelector('code.hljs')?.innerHTML).toContain('hljs-section');
  });

  it('synchronizes scroll position between textarea and backdrop', () => {
    const { container } = render(
      <SyntaxHighlightedTextarea value="line1\nline2\nline3" language="javascript" onChange={() => {}} />,
    );

    const textarea = screen.getByRole('textbox');
    const pre = container.querySelector('pre');

    // Simulate scroll by mocking textarea scroll position getters
    // When handleScroll reads these values, it assigns them to the backdrop
    Object.defineProperty(textarea, 'scrollTop', { value: 100, writable: true });
    Object.defineProperty(textarea, 'scrollLeft', { value: 50, writable: true });
    fireEvent.scroll(textarea);

    // Verify backdrop scroll is synchronized (native scroll, not transform)
    expect(pre?.scrollTop).toBe(100);
    expect(pre?.scrollLeft).toBe(50);
  });

  it('handles null/undefined value gracefully', () => {
    const { container } = render(
      <SyntaxHighlightedTextarea value={undefined as unknown as string} language="javascript" onChange={() => {}} />,
    );

    // Should render &nbsp; for empty content to maintain height
    const codeElement = container.querySelector('code.hljs');
    expect(codeElement?.innerHTML).toContain('&nbsp;');
  });

  describe('Accessibility', () => {
    it('hides backdrop from screen readers', () => {
      const { container } = render(
        <SyntaxHighlightedTextarea value="test" language="javascript" onChange={() => {}} />,
      );

      const pre = container.querySelector('pre');
      expect(pre).toHaveAttribute('aria-hidden', 'true');
    });

    it('passes through aria attributes to textarea', () => {
      render(
        <SyntaxHighlightedTextarea value="test" language="javascript" aria-label="Code editor" onChange={() => {}} />,
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Code editor');
    });
  });
});
