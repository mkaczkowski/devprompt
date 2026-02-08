/**
 * E2E tests for prompt synchronization feature.
 *
 * Tests tagged with @auth require Clerk credentials in .env:
 * - CLERK_SECRET_KEY
 * - E2E_CLERK_USER_EMAIL
 * - E2E_CLERK_USER_PASSWORD
 *
 * Run all tests:     npm run e2e
 * Run only @auth:    npm run e2e -- --grep @auth
 * Skip @auth tests:  npm run e2e -- --grep-invert @auth
 */

import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import { createPromptAndEdit, setupCleanPage } from '../fixtures';

// Helper to check if auth credentials are configured
const hasAuthCredentials = () =>
  !!(process.env.CLERK_SECRET_KEY && process.env.E2E_CLERK_USER_EMAIL && process.env.E2E_CLERK_USER_PASSWORD);

// Helper to sign in test user
async function signInTestUser(page: import('@playwright/test').Page) {
  await setupClerkTestingToken({ page });
  await page.goto('/');
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_CLERK_USER_EMAIL!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });
}

test.describe('Prompt Sync', () => {
  test.describe('Unauthenticated', () => {
    test('hides sync toggle when not signed in', async ({ page }) => {
      await setupCleanPage(page);
      await expect(page.getByRole('button', { name: /sync/i })).not.toBeVisible();
    });

    test('shows sign-in button when not authenticated', async ({ page }) => {
      // Skip if Clerk testing is not configured (needs CLERK_SECRET_KEY)
      test.skip(!process.env.CLERK_SECRET_KEY, 'Clerk testing credentials not configured');

      // Set up Clerk testing token so Clerk can load properly in test environment
      await setupClerkTestingToken({ page });
      await setupCleanPage(page);

      // Wait for Clerk to finish loading (skeleton disappears)
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10000 });
    });

    test('does not make Supabase requests when unauthenticated', async ({ page }) => {
      const supabaseRequests: string[] = [];

      await page.route('**/supabase.co/rest/v1/**', async (route, request) => {
        supabaseRequests.push(`${request.method()} ${request.url()}`);
        await route.fulfill({ status: 200, json: [] });
      });

      await setupCleanPage(page);

      // Create a prompt instantly (no dialog needed)
      await page.getByRole('button', { name: /new prompt|create first prompt/i }).click();
      await expect(page).toHaveURL(/\/prompt\/.+/);
      await page.waitForTimeout(500);

      expect(supabaseRequests).toHaveLength(0);
    });
  });

  test.describe('Authenticated @auth', () => {
    test.beforeEach(async ({ page }) => {
      test.skip(!hasAuthCredentials(), 'Auth credentials not configured');
      await signInTestUser(page);
    });

    test('shows sync toggle when signed in', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('button', { name: /sync/i })).toBeVisible({ timeout: 15000 });
    });

    test('can toggle sync on and off', async ({ page }) => {
      await page.goto('/');
      const syncToggle = page.getByRole('button', { name: /sync/i });
      await expect(syncToggle).toBeVisible({ timeout: 15000 });

      const wasPressed = (await syncToggle.getAttribute('aria-pressed')) === 'true';
      await syncToggle.click();
      await page.waitForTimeout(500);

      if (wasPressed) {
        await expect(syncToggle).toHaveAttribute('aria-pressed', 'false');
      } else {
        await expect(syncToggle).toHaveAttribute('aria-pressed', 'true');
      }

      // Restore original state
      await syncToggle.click();
    });

    test('fetches user profile on page load', async ({ page }) => {
      const profileRequests: string[] = [];

      await page.route('**/supabase.co/rest/v1/profiles**', async (route, request) => {
        profileRequests.push(request.method());
        await route.continue();
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      expect(profileRequests.filter((m) => m === 'GET').length).toBeGreaterThan(0);
    });

    test('syncs prompt to cloud when sync enabled', async ({ page }) => {
      const promptRequests: string[] = [];

      await page.route('**/supabase.co/rest/v1/prompts**', async (route, request) => {
        promptRequests.push(request.method());
        await route.continue();
      });

      await page.goto('/');

      // Enable sync
      const syncToggle = page.getByRole('button', { name: /sync/i });
      await expect(syncToggle).toBeVisible({ timeout: 15000 });
      if ((await syncToggle.getAttribute('aria-pressed')) !== 'true') {
        await syncToggle.click();
        await page.waitForTimeout(1000);
      }

      promptRequests.length = 0;

      // Create prompt
      await createPromptAndEdit(page, '# Sync Test\n\n## Section\nContent');
      await page.waitForTimeout(2000);

      expect(promptRequests).toContain('POST');
    });

    test('syncs prompt deletion to cloud', async ({ page }) => {
      const deleteRequests: string[] = [];

      await page.route('**/supabase.co/rest/v1/prompts**', async (route, request) => {
        if (request.method() === 'DELETE') deleteRequests.push(request.url());
        await route.continue();
      });

      await page.goto('/');

      // Enable sync
      const syncToggle = page.getByRole('button', { name: /sync/i });
      await expect(syncToggle).toBeVisible({ timeout: 15000 });
      if ((await syncToggle.getAttribute('aria-pressed')) !== 'true') {
        await syncToggle.click();
        await page.waitForTimeout(1000);
      }

      // Create and delete prompt
      await createPromptAndEdit(page, '# Delete Test\n\n## Section\nContent');
      await page.goto('/');
      await expect(page.getByText('Delete Test')).toBeVisible();

      await page.locator('[aria-label="Prompt options"]').click();
      await page.getByRole('menuitem', { name: /delete/i }).click();
      await page.getByRole('button', { name: /^delete$/i }).click();
      await page.waitForTimeout(1500);

      expect(deleteRequests.length).toBeGreaterThan(0);
    });
  });
});
