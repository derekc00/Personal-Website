import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { expectedPageTitles, navigationItems } from './fixtures/test-data';

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.navigateAndWait('/');
  });

  test('loads homepage successfully with correct title', async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.expectPageTitle(expectedPageTitles.home);
  });

  test('displays video background and typewriter effect', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check video background container exists
    await helpers.expectElementVisible('.relative.h-screen.w-full');
    
    // Wait for video to load and typewriter to appear
    await page.waitForSelector('h1', { timeout: 15000 });
    
    // Check typewriter text appears
    await expect(page.locator('h1')).toContainText('Welcome to Derek\'s website');
  });

  test('navigation header is present and functional', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check header is present
    await helpers.expectElementVisible('header');
    
    // Check Home link is present
    await helpers.expectElementVisible('a[href="/"]');
    
    // Check navigation items are present on desktop
    for (const item of navigationItems.slice(1)) { // Skip Home as it's handled separately
      await helpers.expectElementVisible(`a[href="${item.href}"]`);
    }
  });

  test('mobile navigation menu works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu button exists
    await helpers.expectElementVisible('button[aria-label="Toggle menu"]');
    
    // Click mobile menu button
    await page.click('button[aria-label="Toggle menu"]');
    
    // Check mobile menu opens
    await helpers.expectElementVisible('[role="dialog"]');
    
    // Check navigation items are present in mobile menu
    for (const item of navigationItems.slice(1)) {
      await helpers.expectElementVisible(`a[href="${item.href}"]`);
    }
  });

  test('theme switcher is present and functional', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check theme switcher button exists
    await helpers.expectElementVisible('button[aria-label="Toggle theme"]');
    
    // Click theme switcher
    await page.click('button[aria-label="Toggle theme"]');
    
    // Check theme changes (either 'dark' or 'light' class should be present)
    const htmlElement = page.locator('html');
    const hasThemeClass = await htmlElement.evaluate((el) => 
      el.classList.contains('dark') || el.classList.contains('light')
    );
    expect(hasThemeClass).toBeTruthy();
  });

  test('navigation links lead to correct pages', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Test each navigation item
    for (const item of navigationItems.slice(1)) { // Skip Home
      await helpers.clickAndWait(`a[href="${item.href}"]`);
      await helpers.expectUrlContains(item.href);
      
      // Navigate back to homepage for next test
      await helpers.navigateAndWait('/');
    }
  });

  test('homepage has proper accessibility attributes', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check main landmark
    await helpers.expectElementVisible('main');
    
    // Check header has proper navigation role
    await helpers.expectElementVisible('header');
    
    // Check mobile menu button has proper aria-label
    if (await page.locator('button[aria-label="Toggle menu"]').isVisible()) {
      await helpers.expectAriaLabel('button[aria-label="Toggle menu"]', 'Toggle menu');
    }
    
    // Check theme switcher has proper aria-label
    await helpers.expectAriaLabel('button[aria-label="Toggle theme"]', 'Toggle theme');
  });

  test('page loads with proper meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', 'Personal website and portfolio');
    
    // Check viewport meta tag
    const metaViewport = page.locator('meta[name="viewport"]');
    await expect(metaViewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');
  });
});