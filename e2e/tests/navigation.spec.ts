import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });

  test('header is present on all pages', async ({ page }) => {
    // Home page
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();

    // 404 page
    await page.goto('/unknown');
    await expect(page.getByRole('banner')).toBeVisible();
  });
});
