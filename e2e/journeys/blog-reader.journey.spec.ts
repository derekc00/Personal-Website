import { test, expect } from '@playwright/test';
import { JourneyHelpers } from '../utils/journey-helpers';

test.describe('Blog Reader Journey', () => {
  test('user can discover and read a blog post', async ({ page }) => {
    const helpers = new JourneyHelpers(page);
    
    // User lands on homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Derek/);
    
    // User navigates to blog
    await helpers.navigateToSection('blog');
    
    // User sees blog posts
    await expect(page.locator('.rounded-xl.border.bg-card')).toHaveCount(7);
    
    // User searches for a specific topic
    const searchInput = page.locator('input[aria-label="Search articles"]');
    await searchInput.fill('coffee');
    await page.waitForTimeout(500); // Debounce
    
    // User sees filtered results
    const coffeePost = page.locator('text=Debugging My Coffee Maker');
    await expect(coffeePost).toBeVisible();
    
    // User clicks on the blog post
    await coffeePost.click();
    await page.waitForURL(/.*debugging-my-coffee-maker/);
    
    // User reads the article content
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('main').first()).toContainText('coffee');
    
    // User navigates back to blog
    const backLink = page.locator('a[href="/blog"], a:has-text("Blog"), a:has-text("← Back")').first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL('/blog');
    }
  });

  test('mobile user can navigate and read blog', async ({ page }) => {
    const helpers = new JourneyHelpers(page);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go directly to blog page on mobile
    await page.goto('/blog');
    
    // Search for content
    await page.fill('input[aria-label="Search articles"]', 'quantum');
    await page.waitForTimeout(500);
    
    // Click on filtered post
    await page.click('text=Quantum Physics Explained by Ducks');
    await page.waitForURL(/.*quantum-physics/);
    
    // Verify content is readable on mobile
    await expect(page.locator('main').first()).toBeVisible();
  });
});