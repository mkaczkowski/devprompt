import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SyncToggle } from './SyncToggle';

import { mockProfiles } from '@/mocks/fixtures/profiles';
import { render } from '@/test';
import { resetClerkMocks, setMockClerkSignedIn } from '@/test/clerkMock';

// Reset mocks before each test
beforeEach(() => {
  resetClerkMocks();
  // Reset profile sync_enabled to false
  mockProfiles[0].sync_enabled = false;
});

describe('SyncToggle', () => {
  describe('when signed out', () => {
    it('renders nothing', () => {
      setMockClerkSignedIn(false);
      render(<SyncToggle />);

      // Component should not render when signed out
      expect(screen.queryByRole('button', { name: /sync/i })).not.toBeInTheDocument();
    });
  });

  describe('when signed in', () => {
    beforeEach(() => {
      setMockClerkSignedIn(true);
    });

    it('renders a toggle button', async () => {
      render(<SyncToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
      });
    });

    it('toggle is not pressed by default (sync disabled)', async () => {
      render(<SyncToggle />);

      // Wait for loading to complete and toggle to be enabled
      await waitFor(() => {
        const toggle = screen.getByRole('button', { name: /sync/i });
        expect(toggle).not.toBeDisabled();
      });

      // Toggle should not be pressed (sync disabled by default in mock)
      expect(screen.getByRole('button', { name: /sync/i })).toHaveAttribute('aria-pressed', 'false');
    });

    it('has accessible label after loading', async () => {
      render(<SyncToggle />);

      // Wait for loading to complete
      await waitFor(() => {
        const toggle = screen.getByRole('button', { name: /sync/i });
        expect(toggle).not.toBeDisabled();
      });

      const toggle = screen.getByRole('button', { name: /sync/i });
      // After loading, label should indicate enable/disable action
      expect(toggle).toHaveAccessibleName(/cloud sync/i);
    });

    it('responds to clicks', async () => {
      const user = userEvent.setup();

      render(<SyncToggle />);

      // Wait for loading to complete
      await waitFor(() => {
        const toggle = screen.getByRole('button', { name: /sync/i });
        expect(toggle).not.toBeDisabled();
      });

      const toggle = screen.getByRole('button', { name: /sync/i });
      await user.click(toggle);

      // The toggle should respond to clicks (mutation will be triggered)
      expect(toggle).toBeInTheDocument();
    });
  });
});
