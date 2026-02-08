import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PullToRefresh } from './pull-to-refresh';

// Helper to create and dispatch native touch events
const dispatchTouchEvent = (element: Element, type: string, clientY: number) => {
  const touch = { clientY, identifier: 0, target: element } as unknown as Touch;
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: type === 'touchend' ? [] : [touch],
    changedTouches: [touch],
  });
  element.dispatchEvent(event);
};

describe('PullToRefresh', () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with full functionality when enabled (default)', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div data-testid="child-content">Content</div>
      </PullToRefresh>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByTestId('pull-to-refresh-container')).toBeInTheDocument();
    expect(screen.getByTestId('pull-to-refresh-content')).toBeInTheDocument();
    expect(screen.queryByTestId('pull-to-refresh-indicator')).not.toBeInTheDocument();
  });

  it('renders as simple wrapper when disabled', () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh} isEnabled={false} className="custom-class">
        <div data-testid="child">Content</div>
      </PullToRefresh>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByTestId('pull-to-refresh-container')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom className to container', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} className="custom-class">
        <div>Content</div>
      </PullToRefresh>,
    );

    expect(screen.getByTestId('pull-to-refresh-container')).toHaveClass('custom-class');
  });

  it('shows indicator during pull', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} threshold={80}>
        <div>Content</div>
      </PullToRefresh>,
    );

    const container = screen.getByTestId('pull-to-refresh-container');

    // Mock scrollTop to 0 (at top)
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });

    act(() => {
      dispatchTouchEvent(container, 'touchstart', 0);
      dispatchTouchEvent(container, 'touchmove', 100);
    });

    expect(screen.getByTestId('pull-to-refresh-indicator')).toBeInTheDocument();
  });

  it('triggers refresh when threshold is exceeded', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} threshold={80} resistance={1}>
        <div>Content</div>
      </PullToRefresh>,
    );

    const container = screen.getByTestId('pull-to-refresh-container');
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });

    act(() => {
      dispatchTouchEvent(container, 'touchstart', 0);
      dispatchTouchEvent(container, 'touchmove', 100);
    });

    // Verify pull distance exceeded threshold (indicator visible)
    expect(screen.getByTestId('pull-to-refresh-indicator')).toBeInTheDocument();

    act(() => {
      dispatchTouchEvent(container, 'touchend', 100);
    });

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not trigger refresh when pull is below threshold', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} threshold={80} resistance={1}>
        <div>Content</div>
      </PullToRefresh>,
    );

    const container = screen.getByTestId('pull-to-refresh-container');
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });

    act(() => {
      dispatchTouchEvent(container, 'touchstart', 0);
      dispatchTouchEvent(container, 'touchmove', 50);
      dispatchTouchEvent(container, 'touchend', 50);
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it('resets indicator after touch ends without refresh', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} threshold={80} resistance={1}>
        <div>Content</div>
      </PullToRefresh>,
    );

    const container = screen.getByTestId('pull-to-refresh-container');
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });

    act(() => {
      dispatchTouchEvent(container, 'touchstart', 0);
      dispatchTouchEvent(container, 'touchmove', 50);
    });

    expect(screen.getByTestId('pull-to-refresh-indicator')).toBeInTheDocument();

    act(() => {
      dispatchTouchEvent(container, 'touchend', 50);
    });

    expect(screen.queryByTestId('pull-to-refresh-indicator')).not.toBeInTheDocument();
  });
});
