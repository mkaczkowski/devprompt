import { describe, expect, it } from 'vitest';

import { PWAUpdatePrompt } from './PWAUpdatePrompt';

import { render } from '@/test';

describe('PWAUpdatePrompt', () => {
  it('renders nothing', () => {
    const { container } = render(<PWAUpdatePrompt />);
    expect(container.innerHTML).toBe('');
  });
});
