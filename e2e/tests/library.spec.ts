import { expect, test } from '@playwright/test';

import { createPromptAndReturn, setupCleanPage } from '../fixtures';

test.describe('Library Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupCleanPage(page);
  });

  // Helper to open card menu - uses specific selector to avoid Card role="button" ambiguity
  async function openCardMenu(page: import('@playwright/test').Page) {
    await page.locator('[aria-label="Prompt options"]').click();
  }

  test.describe('Empty State', () => {
    test('shows empty state when no prompts exist', async ({ page }) => {
      await expect(page.getByText(/build better ai prompts/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create first prompt/i })).toBeVisible();
    });

    test('shows search empty state when no results match', async ({ page }) => {
      await createPromptAndReturn(page, 'Test Prompt', 'Content here');

      // Search for something that doesn't exist
      await page.getByPlaceholder(/search prompts/i).fill('nonexistent');
      await expect(page.getByText(/no matching prompts/i)).toBeVisible();
    });
  });

  test.describe('Create Prompt', () => {
    test('creates prompt instantly and navigates to editor', async ({ page }) => {
      // Click create prompt button (empty state shows "Create First Prompt")
      await page.getByRole('button', { name: /new prompt|create first prompt/i }).click();

      // Verify navigation to editor
      await expect(page).toHaveURL(/\/prompt\/.+/);

      // Verify default prompt has "Instructions" section
      await expect(page.getByText('Instructions').first()).toBeVisible();
    });

    test('creates prompt with default title "Untitled Prompt"', async ({ page }) => {
      await page.getByRole('button', { name: /new prompt|create first prompt/i }).click();

      // Verify navigation to editor
      await expect(page).toHaveURL(/\/prompt\/.+/);

      // Verify default title is shown (as a span, not input)
      await expect(
        page.getByRole('button', { name: /prompt title.*untitled prompt.*press enter to rename/i }),
      ).toBeVisible();
    });

    test('prompt appears in library after creation', async ({ page }) => {
      // Create a prompt instantly
      await page.getByRole('button', { name: /new prompt|create first prompt/i }).click();
      await expect(page).toHaveURL(/\/prompt\/.+/);

      // Return to library
      await page.goto('/');

      // Verify prompt appears with default title
      await expect(page.getByText('Untitled Prompt')).toBeVisible();
    });
  });

  test.describe('Duplicate Prompt', () => {
    test('duplicates prompt with (Copy) suffix', async ({ page }) => {
      await createPromptAndReturn(page, 'Original Prompt', 'Content');

      // Open card menu and click duplicate
      await openCardMenu(page);
      await page.getByRole('menuitem', { name: /duplicate/i }).click();

      // Verify toast
      await expect(page.getByText(/prompt duplicated/i)).toBeVisible();

      // Verify both prompts exist (use exact match to avoid ambiguity)
      await expect(page.getByText('Original Prompt', { exact: true })).toBeVisible();
      await expect(page.getByText('Original Prompt (Copy)', { exact: true })).toBeVisible();
    });
  });

  test.describe('Delete Prompt', () => {
    test('deletes prompt with confirmation dialog', async ({ page }) => {
      await createPromptAndReturn(page, 'Delete Me', 'Content');

      // Open card menu and click delete
      await openCardMenu(page);
      await page.getByRole('menuitem', { name: /delete/i }).click();

      // Verify confirmation dialog
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await expect(page.getByText(/delete prompt\?/i)).toBeVisible();

      // Confirm delete
      await page.getByRole('button', { name: /^delete$/i }).click();

      // Verify prompt is gone and empty state shows
      await expect(page.getByText(/build better ai prompts/i)).toBeVisible();
    });

    test('can cancel delete confirmation', async ({ page }) => {
      await createPromptAndReturn(page, 'Keep Me', 'Content');

      // Open card menu and click delete
      await openCardMenu(page);
      await page.getByRole('menuitem', { name: /delete/i }).click();

      // Cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Verify prompt still exists
      await expect(page.getByText('Keep Me')).toBeVisible();
    });

    test('undo restores deleted prompt', async ({ page }) => {
      await createPromptAndReturn(page, 'Restore Me', 'Content');

      // Delete the prompt
      await openCardMenu(page);
      await page.getByRole('menuitem', { name: /delete/i }).click();
      await page.getByRole('button', { name: /^delete$/i }).click();

      // Click undo in toast
      await page.getByRole('button', { name: /undo/i }).click();

      // Verify restored message
      await expect(page.getByText(/prompt restored/i)).toBeVisible();

      // Verify prompt is back
      await expect(page.getByText('Restore Me')).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('filters prompts by title', async ({ page }) => {
      // Create two prompts
      await createPromptAndReturn(page, 'Alpha Prompt', 'Content');
      await createPromptAndReturn(page, 'Beta Prompt', 'Content');

      // Both should be visible initially
      await expect(page.getByText('Alpha Prompt')).toBeVisible();
      await expect(page.getByText('Beta Prompt')).toBeVisible();

      // Search for "Alpha"
      await page.getByPlaceholder(/search prompts/i).fill('Alpha');

      // Only Alpha should be visible
      await expect(page.getByText('Alpha Prompt')).toBeVisible();
      await expect(page.getByText('Beta Prompt')).not.toBeVisible();

      // Clear search
      await page.getByPlaceholder(/search prompts/i).fill('');

      // Both should be visible again
      await expect(page.getByText('Alpha Prompt')).toBeVisible();
      await expect(page.getByText('Beta Prompt')).toBeVisible();
    });
  });

  test.describe('Card Interaction', () => {
    test('clicking card navigates to editor', async ({ page }) => {
      await createPromptAndReturn(page, 'Clickable Prompt', 'Content');

      // Click the card title (not the menu button)
      await page.getByText('Clickable Prompt').click();

      // Should navigate to editor
      await expect(page).toHaveURL(/\/prompt\/.+/);
    });
  });
});
