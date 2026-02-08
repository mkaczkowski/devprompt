import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import * as sentry from '@/lib/sentry';
import { render } from '@/test';

// Component that throws an error
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
}

// Suppress console.error for error boundary tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows Try Again button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows Reload Page button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('calls onReset when Try Again is clicked', () => {
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('reloads page when Reload Page is clicked', () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /reload page/i }));

    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restore
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('calls captureException with componentStack when error occurs', () => {
    const captureExceptionSpy = vi.spyOn(sentry, 'captureException');

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(captureExceptionSpy).toHaveBeenCalledTimes(1);
    expect(captureExceptionSpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );

    captureExceptionSpy.mockRestore();
  });
});
