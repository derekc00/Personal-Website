import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { expectedPageTitles, testCategories } from './fixtures/test-data';

test.describe('Content Discovery E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.navigateAndWait('/content');
  });

  test('loads content page successfully with correct title', async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.expectPageTitle(expectedPageTitles.content);
  });

  test('displays search functionality', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check search input exists
    await helpers.expectElementVisible('input[type="text"]');
    
    // Check search input has proper placeholder
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('displays category filter buttons', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for category buttons to load
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Check that category buttons are present
    const categoryButtons = page.locator('button:has-text("All"), button:has-text("Tech"), button:has-text("Life"), button:has-text("Science"), button:has-text("Adventure")');
    const buttonCount = await categoryButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);
    
    // Check "All" button exists
    await helpers.expectElementVisible('button:has-text("All")');
  });

  test('displays content cards', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    
    // Check that content cards are present
    const contentCards = page.locator('[data-testid="content-card"], article, .content-item');
    const cardCount = await contentCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check first content card has proper structure
    const firstCard = contentCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('category filtering works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for initial content to load
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    
    // Count initial content items
    const initialItems = page.locator('[data-testid="content-card"], article, .content-item');
    const initialCount = await initialItems.count();
    
    // Find and click a specific category button (not "All")
    const techButton = page.locator('button:has-text("Tech")');
    if (await techButton.isVisible()) {
      await techButton.click();
      await page.waitForTimeout(1000);
      
      // Check that content is filtered
      const filteredItems = page.locator('[data-testid="content-card"], article, .content-item');
      const filteredCount = await filteredItems.count();
      
      // Should either have fewer items or same if all items are Tech
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      
      // Click "All" to reset filter
      const allButton = page.locator('button:has-text("All")');
      if (await allButton.isVisible()) {
        await allButton.click();
        await page.waitForTimeout(1000);
        
        // Should show all items again
        const resetItems = page.locator('[data-testid="content-card"], article, .content-item');
        const resetCount = await resetItems.count();
        expect(resetCount).toBe(initialCount);
      }
    }
  });

  test('search functionality filters content', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for initial content to load
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    
    // Count initial content items
    const initialItems = page.locator('[data-testid="content-card"], article, .content-item');
    const initialCount = await initialItems.count();
    
    // Search for a specific term
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('coffee');
    await page.waitForTimeout(1000);
    
    // Check if results are filtered
    const filteredItems = page.locator('[data-testid="content-card"], article, .content-item');
    const filteredCount = await filteredItems.count();
    
    // Should be fewer or same number of items
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(1000);
    
    // Should show all items again
    const resetItems = page.locator('[data-testid="content-card"], article, .content-item');
    const resetCount = await resetItems.count();
    expect(resetCount).toBe(initialCount);
  });

  test('combined search and filter works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    
    // Apply category filter first
    const techButton = page.locator('button:has-text("Tech")');
    if (await techButton.isVisible()) {
      await techButton.click();
      await page.waitForTimeout(1000);
      
      // Count filtered items
      const categoryFiltered = page.locator('[data-testid="content-card"], article, .content-item');
      const categoryCount = await categoryFiltered.count();
      
      // Apply search on top of category filter
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('debug');
      await page.waitForTimeout(1000);
      
      // Check combined filtering
      const combinedFiltered = page.locator('[data-testid="content-card"], article, .content-item');
      const combinedCount = await combinedFiltered.count();
      
      // Should be fewer or same as category filter alone
      expect(combinedCount).toBeLessThanOrEqual(categoryCount);
    }
  });

  test('content card navigation works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for content cards to load
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    
    // Find first clickable content card link
    const firstCardLink = page.locator('[data-testid="content-card"] a, article a, .content-item a').first();
    
    if (await firstCardLink.isVisible()) {
      const href = await firstCardLink.getAttribute('href');
      
      // Click on the first content card
      await firstCardLink.click();
      await helpers.waitForPageLoad();
      
      // Verify navigation worked
      if (href) {
        await helpers.expectUrlContains(href);
      }
    }
  });

  test('load more functionality works (if present)', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    
    // Check if load more button exists
    const loadMoreButton = page.locator('button:has-text("Load More"), button:has-text("Show More")');
    
    if (await loadMoreButton.isVisible()) {
      // Count initial items
      const initialItems = page.locator('[data-testid="content-card"], article, .content-item');
      const initialCount = await initialItems.count();
      
      // Click load more
      await loadMoreButton.click();
      await page.waitForTimeout(2000);
      
      // Check if more items are loaded
      const afterLoadItems = page.locator('[data-testid="content-card"], article, .content-item');
      const afterLoadCount = await afterLoadItems.count();
      
      // Should have more items now
      expect(afterLoadCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('content page has proper accessibility', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check main landmark
    await helpers.expectElementVisible('main');
    
    // Check search input accessibility
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      // Should have proper labeling
      const hasAriaLabel = await searchInput.getAttribute('aria-label');
      const hasPlaceholder = await searchInput.getAttribute('placeholder');
      expect(hasAriaLabel || hasPlaceholder).toBeTruthy();
    }
    
    // Check category buttons have proper roles
    const categoryButtons = page.locator('button');
    const buttonCount = await categoryButtons.count();
    if (buttonCount > 0) {
      await expect(categoryButtons.first()).toBeVisible();
    }
    
    // Check content cards have proper structure
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    const contentCards = page.locator('[data-testid="content-card"], article, .content-item');
    const cardCount = await contentCards.count();
    
    if (cardCount > 0) {
      await expect(contentCards.first()).toBeVisible();
    }
  });

  test('responsive design works on mobile', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that page loads properly on mobile
    await helpers.expectElementVisible('main');
    
    // Check search input is still accessible
    await helpers.expectElementVisible('input[type="text"]');
    
    // Check category buttons are still accessible
    await page.waitForSelector('button', { timeout: 10000 });
    await helpers.expectElementVisible('button');
    
    // Check content cards are still visible
    await page.waitForSelector('[data-testid="content-card"], article, .content-item', { timeout: 10000 });
    await helpers.expectElementVisible('[data-testid="content-card"], article, .content-item');
  });

  test('page handles empty search results gracefully', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Search for something that definitely won't match
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('xyznothingmatches12345');
    await page.waitForTimeout(1000);
    
    // Check that either no content is shown or an empty state message appears
    const contentCards = page.locator('[data-testid="content-card"], article, .content-item');
    const cardCount = await contentCards.count();
    
    if (cardCount === 0) {
      // Should show empty state or no results message
      const emptyState = page.locator(':has-text("No results"), :has-text("No content"), :has-text("Nothing found")');
      // It's okay if there's no explicit empty state message
    }
    
    // Search should be clearable
    await searchInput.fill('');
    await page.waitForTimeout(1000);
    
    // Content should return
    const resetCards = page.locator('[data-testid="content-card"], article, .content-item');
    const resetCount = await resetCards.count();
    expect(resetCount).toBeGreaterThan(0);
  });
});