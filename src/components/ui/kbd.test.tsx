import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kbd, KbdGroup } from './kbd';

describe('Kbd', () => {
  it('renders keyboard key text', () => {
    render(<Kbd>Enter</Kbd>);
    expect(screen.getByText('Enter')).toBeInTheDocument();
  });

  it('renders as kbd element', () => {
    render(<Kbd>⌘</Kbd>);
    const kbd = screen.getByText('⌘');
    expect(kbd.tagName).toBe('KBD');
  });

  it('applies custom className', () => {
    render(<Kbd className="custom-class">K</Kbd>);
    const kbd = screen.getByText('K');
    expect(kbd).toHaveClass('custom-class');
  });

  it('applies base styles', () => {
    render(<Kbd>Ctrl</Kbd>);
    const kbd = screen.getByText('Ctrl');
    expect(kbd).toHaveClass('bg-muted', 'rounded', 'border');
  });
});

describe('KbdGroup', () => {
  it('renders children', () => {
    render(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>,
    );
    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('Enter')).toBeInTheDocument();
  });

  it('renders as span element', () => {
    render(<KbdGroup data-testid="group">content</KbdGroup>);
    const group = screen.getByTestId('group');
    expect(group.tagName).toBe('SPAN');
  });

  it('applies flex layout', () => {
    render(<KbdGroup data-testid="group">content</KbdGroup>);
    const group = screen.getByTestId('group');
    expect(group).toHaveClass('inline-flex', 'items-center');
  });
});
