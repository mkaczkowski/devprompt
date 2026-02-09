import { useRegisterSW } from 'virtual:pwa-register/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PWAUpdatePrompt } from './PWAUpdatePrompt';

import { toast } from '@/lib/toast';
import { render, mockMatchMedia } from '@/test';

vi.mock('@/lib/toast', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn() }),
}));

const mockUseRegisterSW = vi.mocked(useRegisterSW);

describe('PWAUpdatePrompt', () => {
  beforeEach(() => {
    window.matchMedia = mockMatchMedia(false);
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [false, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    });
  });

  it('renders nothing', () => {
    const { container } = render(<PWAUpdatePrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('shows offline toast only when installed as PWA', () => {
    window.matchMedia = mockMatchMedia(true);
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [false, vi.fn()],
      offlineReady: [true, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<PWAUpdatePrompt />);
    expect(toast.success).toHaveBeenCalledWith('App ready to work offline');
  });

  it('does not show offline toast in regular browser', () => {
    window.matchMedia = mockMatchMedia(false);
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [false, vi.fn()],
      offlineReady: [true, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<PWAUpdatePrompt />);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows update toast when new version is available', () => {
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [true, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<PWAUpdatePrompt />);
    expect(toast).toHaveBeenCalledWith('New version available', expect.objectContaining({ duration: Infinity }));
  });
});
