/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixtures use `use()` API, not React hooks */
import { expect, test as base, type Page } from '@playwright/test';

/**
 * Common test setup function.
 * Clears storage and navigates to specified path.
 */
export async function setupPage(page: Page, path = '/'): Promise<void> {
  // Clear any persisted state
  await page.context().clearCookies();

  // Navigate to path
  await page.goto(path);

  // Wait for app to be ready
  await page.waitForSelector('[data-slot="dropdown-menu-trigger"], button', { timeout: 5000 });
}

/**
 * Setup page with clean localStorage state.
 * Use this for tests that need completely fresh state.
 */
export async function setupCleanPage(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Wait for the app to be ready - either the library header (with prompts) or empty state (without)
  await page.waitForSelector('input[type="search"], main', { timeout: 5000 });
}

/**
 * Create a prompt instantly and navigate to editor.
 * New prompts are created with a default "Instructions" section.
 * Optionally, set title and content after creation.
 */
export async function createPromptAndEdit(
  page: Page,
  options?: { title?: string; sectionTitle?: string; content?: string },
): Promise<void> {
  // Handle both states: "New Prompt" (when prompts exist) or "Create First Prompt" (empty state)
  await page.getByRole('button', { name: /new prompt|create first prompt/i }).click();
  await expect(page).toHaveURL(/\/prompt\/.+/);

  if (options?.title) {
    // Click on the title span to enter edit mode, then fill and press Enter
    await page.getByRole('button', { name: /prompt title.*press enter to rename/i }).click();
    const titleInput = page.getByRole('textbox', { name: /prompt title/i });
    await titleInput.fill(options.title);
    await titleInput.press('Enter');
  }

  if (options?.sectionTitle) {
    // Click on section title to enter edit mode
    await page
      .getByRole('button', { name: /section title.*press enter to edit/i })
      .first()
      .click();
    const sectionTitleInput = page.getByRole('textbox', { name: /section title/i }).first();
    await sectionTitleInput.fill(options.sectionTitle);
    await sectionTitleInput.press('Enter');
  }

  if (options?.content) {
    const contentTextarea = page.getByPlaceholder(/enter section content/i);
    if (await contentTextarea.isVisible()) {
      // Desktop: use textarea directly
      await contentTextarea.fill(options.content);
    } else {
      // Mobile: open drawer, fill content, and save
      // Click on the mobile content preview div (it shows "Tap to edit..." or existing content)
      await page
        .locator('[role="button"]')
        .filter({ hasText: /tap to edit/i })
        .first()
        .click();

      // Wait for drawer to open
      await expect(page.getByRole('heading', { name: /edit section/i })).toBeVisible();

      // Fill content in drawer
      const drawerContent = page.locator('#section-content');
      await drawerContent.clear();
      await drawerContent.fill(options.content);

      // Save changes
      await page.getByRole('button', { name: /save/i }).click();

      // Wait for drawer to close
      await expect(page.getByRole('heading', { name: /edit section/i })).not.toBeVisible();
    }
  }
}

/**
 * Create a prompt with custom title and content, then return to library.
 * Since prompts are created instantly with defaults, we need to edit after creation.
 */
export async function createPromptAndReturn(page: Page, title: string, content: string): Promise<void> {
  // Click New Prompt (or Create First Prompt in empty state) - instantly creates and navigates to editor
  await page.getByRole('button', { name: /new prompt|create first prompt/i }).click();
  await expect(page).toHaveURL(/\/prompt\/.+/);

  // Edit the section content first (to avoid blur issues)
  const textarea = page.getByPlaceholder(/enter section content/i);
  if (await textarea.isVisible()) {
    await textarea.fill(content);
  }

  // Edit the title - click on the span to open rename dialog, then fill and confirm
  await page.getByRole('button', { name: /prompt title.*press enter to rename/i }).click();
  const titleInput = page.getByRole('textbox', { name: /prompt title/i });
  await titleInput.fill(title);
  await titleInput.press('Enter');

  // Wait for the title to be updated in the UI (the span should now show the new title)
  await expect(
    page.getByRole('button', { name: new RegExp(`prompt title.*${title}.*press enter to rename`, 'i') }),
  ).toBeVisible({ timeout: 5000 });

  // Wait for state to persist to localStorage (store has 500ms debounce delay + buffer)
  await page.waitForTimeout(1000);

  // Return to library and wait for title to appear
  await page.goto('/');
  await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 10000 });
}

// ============================================================================
// Custom Test Fixtures
// ============================================================================

interface MobileAwareFixtures {
  /**
   * Navigate to the preview panel (handles mobile tab switching automatically).
   */
  navigateToPreview: () => Promise<void>;

  /**
   * Navigate to the edit panel (handles mobile tab switching automatically).
   */
  navigateToEdit: () => Promise<void>;

  /**
   * Get the section content locator (textarea on desktop, text preview on mobile).
   */
  getSectionContent: (contentText: string) => ReturnType<Page['getByText']> | ReturnType<Page['getByPlaceholder']>;

  /**
   * Create a prompt instantly and navigate to editor with clean state.
   * Optionally set title, section title, and content after creation.
   */
  createPrompt: (options?: { title?: string; sectionTitle?: string; content?: string }) => Promise<void>;
}

/**
 * Extended test with mobile-aware fixtures.
 * Use this instead of the base `test` for tests that need platform-specific behavior.
 */
export const test = base.extend<MobileAwareFixtures>({
  navigateToPreview: async ({ page, isMobile }, use) => {
    await use(async () => {
      if (isMobile) {
        await page.getByRole('tab', { name: /^preview$/i }).click();
      }
      // On desktop, preview panel is always visible
    });
  },

  navigateToEdit: async ({ page, isMobile }, use) => {
    await use(async () => {
      if (isMobile) {
        await page.getByRole('tab', { name: /^edit$/i }).click();
      }
      // On desktop, edit panel is always visible
    });
  },

  getSectionContent: async ({ page, isMobile }, use) => {
    await use((contentText: string) => {
      if (isMobile) {
        // Mobile shows content as text preview
        return page.getByText(contentText);
      }
      // Desktop shows editable textarea
      return page.getByPlaceholder(/enter section content/i);
    });
  },

  createPrompt: async ({ page }, use) => {
    // Setup clean state before providing the fixture
    await setupCleanPage(page);

    await use(async (options?: { title?: string; sectionTitle?: string; content?: string }) => {
      await createPromptAndEdit(page, options);
    });
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
