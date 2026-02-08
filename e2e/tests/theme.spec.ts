import { expect, test } from '@playwright/test';

import { setupPage } from '../fixtures';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('defaults to light theme', async ({ page }) => {
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('toggles between light and dark theme', async ({ page }) => {
    const html = page.locator('html');

    // Toggle to dark
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(html).toHaveClass(/dark/);

    // Toggle back to light
    await page.getByRole('button', { name: /switch to light mode/i }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('persists theme preference across reload', async ({ page }) => {
    // Set dark theme
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Reload and verify
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
