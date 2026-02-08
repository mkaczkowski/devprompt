import { describe, expect, it, vi } from 'vitest';

import { copyToClipboard } from '@/lib/clipboard';

describe('copyToClipboard', () => {
  it('returns true on successful copy', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
  });

  it('returns false when clipboard API fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error')),
      },
    });

    const result = await copyToClipboard('test text');
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
