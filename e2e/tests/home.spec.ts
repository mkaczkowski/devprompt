import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays library page', async ({ page }) => {
    // Library page should show either the search header (with prompts) or empty state (without)
    await expect(page.getByPlaceholder(/search prompts/i).or(page.getByText(/build better ai prompts/i))).toBeVisible();
  });

  test('has correct page structure', async ({ page }) => {
    // Header present
    await expect(page.getByRole('banner')).toBeVisible();

    // Main content area
    await expect(page.getByRole('main')).toBeVisible();

    // App title in header (specific to header to avoid conflict with page heading)
    await expect(page.getByRole('banner').getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('skip link navigates to main content', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: /skip to main content/i });

    // Ensure skip link exists in DOM
    await expect(skipLink).toBeAttached();

    // Focus the skip link explicitly (more reliable than Tab in E2E)
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    // Verify skip link becomes visible when focused
    await expect(skipLink).toBeVisible();

    // Activate skip link with keyboard (how real users interact with skip links)
    await skipLink.press('Enter');

    // Main should be scrolled into view
    await expect(page.locator('#main')).toBeInViewport();
  });
});
