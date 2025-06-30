import { test, expect } from '@playwright/test';

test.describe('Content Discovery Journey', () => {
  test('user can discover content through filtering and search', async ({ page }) => {
    // User navigates to content page
    await page.goto('/content');
    await page.waitForLoadState('domcontentloaded');
    
    // User sees available content
    const contentCards = page.locator('[data-testid="content-card"], article, .rounded-xl.border');
    await expect(contentCards.first()).toBeVisible({ timeout: 10000 });
    
    // User filters by category
    const techFilter = page.locator('button:has-text("Tech"), button:has-text("Technology")').first();
    if (await techFilter.isVisible()) {
      await techFilter.click();
      await page.waitForTimeout(300); // Animation
      
      // Verify filtered content
      const filteredContent = await contentCards.count();
      expect(filteredContent).toBeGreaterThan(0);
    }
    
    // User searches for specific content
    const searchInput = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('diving');
      await page.waitForTimeout(500); // Debounce
      
      // Verify search results
      await expect(page.locator('text=Diving')).toBeVisible();
    }
    
    // User clicks on content to read
    const firstContent = contentCards.first();
    const contentLink = firstContent.locator('a').first();
    if (await contentLink.isVisible()) {
      const href = await contentLink.getAttribute('href');
      await contentLink.click();
      
      // Verify navigation to content
      if (href) {
        await expect(page).toHaveURL(new RegExp(href));
      }
    }
  });

  test('user can reset filters and see all content', async ({ page }) => {
    await page.goto('/content');
    await page.waitForLoadState('domcontentloaded');
    
    // Apply a filter
    const categoryButton = page.locator('button').filter({ hasText: /Tech|Life|Science/ }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(300);
      
      // Click "All" to reset
      const allButton = page.locator('button:has-text("All")').first();
      if (await allButton.isVisible()) {
        await allButton.click();
        await page.waitForTimeout(300);
        
        // Verify all content is visible again
        const allContent = page.locator('[data-testid="content-card"], article, .rounded-xl.border');
        const count = await allContent.count();
        expect(count).toBeGreaterThan(1);
      }
    }
  });
});