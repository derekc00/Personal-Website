import { test, expect } from '@playwright/test';

test.describe('Core Functionality Critical Paths', () => {
  test('search functionality works across the site', async ({ page }) => {
    // Test blog search
    await page.goto('/blog');
    const blogSearch = page.locator('input[aria-label="Search articles"]');
    await blogSearch.fill('coffee');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Debugging My Coffee Maker')).toBeVisible();
    
    // Clear search
    await blogSearch.clear();
    await page.waitForTimeout(500);
    
    // Verify all posts return
    const allPosts = page.locator('.rounded-xl.border.bg-card');
    await expect(allPosts).toHaveCount(7);
  });

  test('images load successfully', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for first image to load
    const firstImage = page.locator('img').first();
    await expect(firstImage).toBeVisible();
    
    // Verify image has loaded (not placeholder)
    const imageSrc = await firstImage.getAttribute('src');
    expect(imageSrc).toBeTruthy();
    // Next.js Image component transforms URLs
    expect(imageSrc).toMatch(/\/_next\/image\?url=.*home\.jpg/);
    
    // Check natural dimensions to ensure image loaded
    const dimensions = await firstImage.evaluate((img: HTMLImageElement) => ({
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
    
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
  });

  test('page performance - initial load', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Critical content should be visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('external links open in new tab', async ({ page }) => {
    await page.goto('/projects');
    
    // Find GitHub links
    const githubLinks = page.locator('a[href*="github.com"]');
    const count = await githubLinks.count();
    
    if (count > 0) {
      // Check first GitHub link has target="_blank"
      const target = await githubLinks.first().getAttribute('target');
      expect(target).toBe('_blank');
      
      // Check it has rel="noopener noreferrer" for security
      const rel = await githubLinks.first().getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });
});