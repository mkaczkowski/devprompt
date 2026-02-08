import type { SharedPromptRpcResponse } from '../../src/types/database';
import { expect, test } from '../fixtures';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_SHARED_PROMPT: SharedPromptRpcResponse = {
  id: 'shared-prompt-001',
  title: 'E2E Shared Prompt',
  description: 'A prompt shared for testing',
  share_token: 'test-share-token-abc',
  shared_at: '2025-06-01T12:00:00Z',
  user_id: 'user-123',
  data: {
    sections: [
      { id: 's1', title: 'Introduction', content: 'Welcome to this prompt.', enabled: true, collapsed: false },
      { id: 's2', title: 'Details', content: 'Here are the details.', enabled: true, collapsed: false },
    ],
    instructions: '',
  },
  author: {
    id: 'author-456',
    full_name: 'Jane Doe',
    avatar_url: null,
  },
};

// ---------------------------------------------------------------------------
// Helper — intercept the Supabase RPC and return a canned response
// ---------------------------------------------------------------------------

async function mockSharedPromptApi(page: import('@playwright/test').Page, response: SharedPromptRpcResponse | null) {
  await page.route('**/rest/v1/rpc/get_shared_prompt_by_token', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    }),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Shared Prompt', () => {
  test('shows not-found for invalid token', async ({ page }) => {
    await mockSharedPromptApi(page, null);

    await page.goto('/s/invalid-token');

    // "Prompt not found" message should appear
    await expect(page.getByText(/prompt not found/i)).toBeVisible();

    // "Go to Library" button should navigate back to home
    await page.getByRole('button', { name: /go to library/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('displays shared prompt content', async ({ page }) => {
    await mockSharedPromptApi(page, MOCK_SHARED_PROMPT);

    await page.goto('/s/test-share-token-abc');

    // Title and author
    await expect(page.getByText('E2E Shared Prompt')).toBeVisible();
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await expect(page.getByText(/shared by/i)).toBeVisible();

    // Metadata: section count and token count
    await expect(page.getByText(/2 sections/i)).toBeVisible();
    await expect(page.getByText(/tokens/i)).toBeVisible();
  });

  test('imports prompt to library', async ({ page }) => {
    await mockSharedPromptApi(page, MOCK_SHARED_PROMPT);

    await page.goto('/s/test-share-token-abc');

    // Click import button
    await page.getByRole('button', { name: /import to library/i }).click();

    // Should navigate to the editor for the newly created prompt
    await expect(page).toHaveURL(/\/prompt\/.+/);

    // Navigate back to library and verify the prompt appears
    await page.goto('/');
    await expect(page.getByText('E2E Shared Prompt')).toBeVisible();
  });

  test('switches preview formats', async ({ page, isMobile }) => {
    await mockSharedPromptApi(page, MOCK_SHARED_PROMPT);

    await page.goto('/s/test-share-token-abc');

    // On mobile, switch to the Preview tab first
    if (isMobile) {
      await page.getByRole('tab', { name: /^preview$/i }).click();
    }

    // Switch to Markdown format
    await page.getByRole('tab', { name: /markdown/i }).click();
    const textarea = page.locator('textarea').last();
    await expect(textarea).toBeVisible();

    // Switch to XML format
    await page.getByRole('tab', { name: /xml/i }).click();
    await expect(page.locator('textarea').last()).toBeVisible();

    // Switch to Rendered preview
    await page.getByRole('tab', { name: /rendered preview/i }).click();
    await expect(page.locator('.prose')).toBeVisible();
  });
});
