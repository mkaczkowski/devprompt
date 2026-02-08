import { expect, test } from '../fixtures';

test.describe('Editor Feature', () => {
  test.describe('Editor Layout', () => {
    test('displays sections from created prompt', async ({ createPrompt, page }) => {
      await createPrompt({ title: 'Test Prompt', sectionTitle: 'Instructions', content: 'Follow these steps.' });

      // Verify sections are displayed - use text content inside cards
      await expect(page.getByText('Instructions').first()).toBeVisible();

      // Verify prompt title is shown
      await expect(page.getByText('Test Prompt').first()).toBeVisible();
    });

    test('shows back button that navigates to library', async ({ createPrompt, page }) => {
      await createPrompt({ title: 'Back Test', content: 'Content' });

      // Click app title link to navigate back
      await page.getByRole('link', { name: /navigate to home/i }).click();

      // Should be back at library
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Back Test')).toBeVisible();
    });
  });

  test.describe('Section Management', () => {
    test('can toggle section enabled/disabled', async ({ createPrompt, page }) => {
      await createPrompt({ title: 'Toggle Test', sectionTitle: 'Section One', content: 'Content' });

      // Get section card for visual verification
      const sectionCard = page.locator('[data-slot="card"]').last();

      // Open section menu - get the specific button with aria-label
      await page.locator('button[aria-label="Section options"]').click();
      await page.getByRole('menuitem', { name: /disable/i }).click();

      // Verify toast
      await expect(page.getByText(/section disabled/i)).toBeVisible();

      // Verify the section card visually shows as disabled (opacity-50)
      await expect(sectionCard).toHaveClass(/opacity-50/);

      // Wait for dropdown to fully close
      await expect(page.getByRole('menu')).not.toBeVisible();

      // Re-enable
      await page.locator('button[aria-label="Section options"]').click();
      await page.getByRole('menuitem', { name: /enable/i }).click();

      // Verify toast
      await expect(page.getByText(/section enabled/i)).toBeVisible();

      // Verify section is no longer dimmed
      await expect(sectionCard).not.toHaveClass(/opacity-50/);
    });

    test('can collapse and expand section', async ({ createPrompt, page, getSectionContent }) => {
      await createPrompt({ title: 'Collapse Test', sectionTitle: 'My Section', content: 'This is the content.' });

      // Get platform-appropriate content locator
      const sectionContent = getSectionContent('This is the content.');

      // Content should be visible initially
      await expect(sectionContent).toBeVisible();

      // Click collapse button
      await page.locator('button[aria-label="Collapse section"]').click();

      // Content should be hidden
      await expect(sectionContent).not.toBeVisible();

      // Click expand button
      await page.locator('button[aria-label="Expand section"]').click();

      // Content should be visible again
      await expect(sectionContent).toBeVisible();
    });

    test('can add new section', async ({ createPrompt, page }) => {
      await createPrompt({ title: 'Add Test', sectionTitle: 'First Section', content: 'Content' });

      // Should have 2 cards initially (Instructions + 1 section)
      const cards = page.locator('[data-slot="card"]');
      await expect(cards).toHaveCount(2);

      // Click add section button
      await page.getByRole('button', { name: /add section/i }).click();

      // Should now have 3 cards
      await expect(cards).toHaveCount(3);
    });

    test('can remove section with undo', async ({ createPrompt, page }) => {
      await createPrompt({ title: 'Remove Test', sectionTitle: 'Delete Me', content: 'Content' });

      // Open section menu and remove
      await page.locator('button[aria-label="Section options"]').click();
      await page.getByRole('menuitem', { name: /remove/i }).click();

      // Verify toast with undo
      await expect(page.getByText(/section removed/i)).toBeVisible();

      // Section should be gone
      await expect(page.getByText('Delete Me').first()).not.toBeVisible();

      // Click undo
      await page.getByRole('button', { name: /undo/i }).click();

      // Section should be restored
      await expect(page.getByText(/section restored/i)).toBeVisible();
      await expect(page.getByText('Delete Me').first()).toBeVisible();
    });
  });

  test.describe('Preview Panel', () => {
    test('can switch between preview formats', async ({ createPrompt, page, navigateToPreview }) => {
      await createPrompt({ title: 'Format Test', sectionTitle: 'Section', content: 'Some content here.' });

      // Navigate to preview (handles mobile tab switching)
      await navigateToPreview();

      // Click rendered preview tab to ensure it's active
      await page.getByRole('tab', { name: /rendered preview/i }).click();

      // Content should be visible in preview
      await expect(page.getByText('Some content here.')).toBeVisible();
    });

    test('can switch to markdown format', async ({ createPrompt, page, navigateToPreview }) => {
      await createPrompt({ title: 'Markdown Test', sectionTitle: 'MySection', content: 'Content here' });

      // Navigate to preview (handles mobile tab switching)
      await navigateToPreview();

      // Click markdown tab
      await page.getByRole('tab', { name: /markdown/i }).click();

      // Should show textarea with markdown format
      const textarea = page.locator('textarea').last();
      await expect(textarea).toBeVisible();
      await expect(textarea).toContainText('## MySection');
    });

    test('can switch to XML format', async ({ createPrompt, page, navigateToPreview }) => {
      await createPrompt({ title: 'XML Test', sectionTitle: 'My Section', content: 'Content' });

      // Navigate to preview (handles mobile tab switching)
      await navigateToPreview();

      // Click XML tab
      await page.getByRole('tab', { name: /xml/i }).click();

      // Should show XML format with tags
      const textarea = page.locator('textarea').last();
      await expect(textarea).toBeVisible();
      await expect(textarea).toContainText('<my-section>');
    });
  });

  test.describe('Copy to Clipboard', () => {
    test('copy button is visible in preview panel', async ({ createPrompt, page, navigateToPreview }) => {
      await createPrompt({ title: 'Copy Test', sectionTitle: 'Section', content: 'Content' });

      // Navigate to preview (handles mobile tab switching)
      await navigateToPreview();

      // Find copy button
      const copyButton = page.locator('button[aria-label="Copy prompt"]');
      await expect(copyButton.first()).toBeVisible();
    });
  });

  test.describe('Mobile Layout', () => {
    test('shows Edit/Preview tabs on mobile', async ({ createPrompt, page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-only test');

      await createPrompt({ title: 'Mobile Test', sectionTitle: 'Section', content: 'Content here' });

      // Should show Edit and Preview tabs on mobile
      await expect(page.getByRole('tab', { name: /^edit$/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /^preview$/i })).toBeVisible();

      // Edit tab should be active by default
      await expect(page.getByRole('tab', { name: /^edit$/i })).toHaveAttribute('data-state', 'active');
    });

    test('can switch between Edit and Preview tabs', async ({
      createPrompt,
      page,
      isMobile,
      navigateToPreview,
      navigateToEdit,
    }) => {
      test.skip(!isMobile, 'Mobile-only test');

      await createPrompt({ title: 'Tab Test', sectionTitle: 'Section', content: 'Tab content' });

      // Should start on Edit tab with section card visible
      await expect(page.locator('[data-slot="card"]').first()).toBeVisible();

      // Switch to Preview tab
      await navigateToPreview();

      // Preview format tabs should be visible
      await expect(page.getByRole('tab', { name: /rendered preview/i })).toBeVisible();

      // Switch back to Edit tab
      await navigateToEdit();

      // Section card should be visible again
      await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
    });

    test('opens drawer when tapping section content', async ({ createPrompt, page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-only test');

      await createPrompt({ title: 'Drawer Test', sectionTitle: 'My Section', content: 'Original content' });

      // Tap on section content to open drawer
      await page.getByText('Original content').click();

      // Drawer should open with Edit Section title
      await expect(page.getByRole('heading', { name: /edit section/i })).toBeVisible();

      // Should have title and content fields in drawer
      await expect(page.locator('#section-title')).toBeVisible();
      await expect(page.locator('#section-content')).toBeVisible();

      // Content field should be populated with section content
      await expect(page.locator('#section-content')).toHaveValue('Original content');
      await expect(page.locator('#section-title')).toHaveValue('My Section');
    });

    test('can edit section via drawer and save', async ({ createPrompt, page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-only test');

      await createPrompt({ title: 'Drawer Edit', sectionTitle: 'Edit Me', content: 'Old content' });

      // Open drawer
      await page.getByText('Old content').click();
      await expect(page.getByRole('heading', { name: /edit section/i })).toBeVisible();

      // Edit content using drawer's content field
      const contentField = page.locator('#section-content');
      await contentField.clear();
      await contentField.fill('New updated content');

      // Save changes
      await page.getByRole('button', { name: /save/i }).click();

      // Drawer should close and new content visible
      await expect(page.getByRole('heading', { name: /edit section/i })).not.toBeVisible();
      await expect(page.getByText('New updated content')).toBeVisible();
    });

    test('can cancel drawer without saving', async ({ createPrompt, page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-only test');

      await createPrompt({ title: 'Cancel Test', sectionTitle: 'Section', content: 'Keep this content' });

      // Open drawer and modify
      await page.getByText('Keep this content').click();
      const contentField = page.locator('#section-content');
      await contentField.clear();
      await contentField.fill('Changed content');

      // Cancel instead of save
      await page.getByRole('button', { name: /cancel/i }).click();

      // Original content should still be visible
      await expect(page.getByText('Keep this content')).toBeVisible();
    });
  });

  test.describe('Desktop Layout', () => {
    test('shows resizable panels on desktop', async ({ createPrompt, page, isMobile }) => {
      test.skip(isMobile, 'Desktop-only test');

      await createPrompt({ title: 'Desktop Test', sectionTitle: 'Section', content: 'Content' });

      // Should show both panels with resize handle
      await expect(page.locator('[data-testid="code-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();

      // Should NOT show Edit/Preview tabs
      await expect(page.getByRole('tab', { name: /^edit$/i })).not.toBeVisible();
    });

    test('section content is directly editable via textarea', async ({ createPrompt, page, isMobile }) => {
      test.skip(isMobile, 'Desktop-only test');

      await createPrompt({ title: 'Textarea Test', sectionTitle: 'Section', content: 'Edit directly' });

      // Should have textarea for direct editing
      const textarea = page.getByPlaceholder(/enter section content/i);
      await expect(textarea).toBeVisible();

      // Edit content directly
      await textarea.clear();
      await textarea.fill('Directly edited content');

      // Content should be updated
      await expect(textarea).toHaveValue('Directly edited content');
    });
  });
});
