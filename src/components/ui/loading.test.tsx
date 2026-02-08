import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InlineLoading, Loading, PageLoading } from '@/components/ui/loading';
import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonText } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { render } from '@/test';

describe('Spinner', () => {
  it.each([
    { size: 'sm', expectedClass: 'size-4' },
    { size: 'default', expectedClass: 'size-6' },
    { size: 'lg', expectedClass: 'size-8' },
  ] as const)('renders $size size with $expectedClass', ({ size, expectedClass }) => {
    const { container } = render(<Spinner size={size} />);
    expect(container.querySelector('svg')).toHaveClass(expectedClass);
  });

  it('accepts custom className', () => {
    const { container } = render(<Spinner className="text-primary" />);
    expect(container.querySelector('svg')).toHaveClass('text-primary');
  });
});

describe('Loading', () => {
  it('renders spinner with optional text', () => {
    const { container, rerender } = render(<Loading />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Loading text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders full screen when specified', () => {
    const { container } = render(<Loading fullScreen />);
    expect(container.firstChild).toHaveClass('fixed', 'inset-0');
  });
});

describe('PageLoading / InlineLoading', () => {
  it.each([
    { Component: PageLoading, name: 'PageLoading' },
    { Component: InlineLoading, name: 'InlineLoading' },
  ])('$name renders loading text', ({ Component }) => {
    render(<Component />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('renders with animate-pulse', () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders SkeletonText with specified lines', () => {
    const { container } = render(<SkeletonText lines={3} />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('renders SkeletonCard', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('SkeletonAvatar', () => {
  it.each([
    { size: 'sm', expectedClass: 'size-8' },
    { size: 'default', expectedClass: 'size-10' },
    { size: 'lg', expectedClass: 'size-12' },
  ] as const)('renders $size with $expectedClass', ({ size, expectedClass }) => {
    const { container } = render(<SkeletonAvatar size={size} />);
    expect(container.firstChild).toHaveClass(expectedClass);
  });
});
