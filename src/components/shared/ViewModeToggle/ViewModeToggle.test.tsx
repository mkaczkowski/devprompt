import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Eye, FileText } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ViewModeOption } from './ViewModeToggle';
import { ViewModeToggle } from './ViewModeToggle';

import { render } from '@/test';

type TestMode = 'source' | 'rendered';

const options: ViewModeOption<TestMode>[] = [
  { value: 'source', icon: FileText, label: 'Source' },
  { value: 'rendered', icon: Eye, label: 'Rendered' },
];

describe('ViewModeToggle', () => {
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('displays all available options', () => {
    render(<ViewModeToggle value="source" onValueChange={mockOnValueChange} options={options} />);

    expect(screen.getByRole('tab', { name: 'Source' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Rendered' })).toBeVisible();
  });

  it('indicates active option when value is set', () => {
    render(<ViewModeToggle value="rendered" onValueChange={mockOnValueChange} options={options} />);

    expect(screen.getByRole('tab', { name: 'Rendered', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Source', selected: false })).toBeInTheDocument();
  });

  it('switches mode when user clicks different option', async () => {
    const user = userEvent.setup();

    render(<ViewModeToggle value="source" onValueChange={mockOnValueChange} options={options} />);

    await user.click(screen.getByRole('tab', { name: 'Rendered' }));

    expect(mockOnValueChange).toHaveBeenCalledWith('rendered');
  });

  it('does not trigger change when user clicks active option', async () => {
    const user = userEvent.setup();

    render(<ViewModeToggle value="source" onValueChange={mockOnValueChange} options={options} />);

    await user.click(screen.getByRole('tab', { name: 'Source' }));

    expect(mockOnValueChange).not.toHaveBeenCalled();
  });

  it('switches mode when user presses arrow key', async () => {
    const user = userEvent.setup();

    render(<ViewModeToggle value="source" onValueChange={mockOnValueChange} options={options} />);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(mockOnValueChange).toHaveBeenCalledWith('rendered');
  });
});
