import { test, expect } from '@playwright/test';

test.describe('Critical Navigation Paths', () => {
  test('main navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to each main section
    const navLinks = [
      { text: 'About', url: '/about' },
      { text: 'Projects', url: '/projects' },
      { text: 'Blog', url: '/blog' },
    ];
    
    for (const link of navLinks) {
      // Find and click nav link
      await page.click(`text=${link.text}`);
      await expect(page).toHaveURL(link.url);
      
      // Verify page loaded
      await expect(page.locator('main')).toBeVisible();
      
      // Navigate back home
      await page.click('text=Home');
      await expect(page).toHaveURL('/');
    }
  });

  test('404 page handles invalid routes gracefully', async ({ page }) => {
    await page.goto('/non-existent-page', { waitUntil: 'domcontentloaded' });
    
    // Should see 404 or redirect to home
    const pageTitle = await page.title();
    const url = page.url();
    
    // Check if we're on a 404 page or got redirected
    const is404 = pageTitle.includes('404') || pageTitle.includes('Not Found');
    const isHome = url.endsWith('/');
    const hasNotFoundContent = await page.locator('text=/404|not found/i').count() > 0;
    
    expect(is404 || isHome || hasNotFoundContent).toBeTruthy();
  });

  test('theme switcher persists across navigation', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
    
    if (await themeToggle.isVisible()) {
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(100);
      
      // Check if theme changed
      const isDark = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      // Navigate to another page
      await page.locator('text=Blog').first().click();
      await page.waitForURL('/blog', { timeout: 15000 });
      
      // Verify theme persisted
      const isDarkAfterNav = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      expect(isDarkAfterNav).toBe(isDark);
    }
  });

  test('mobile navigation menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Find and click mobile menu button
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Verify menu opened
      await expect(page.locator('[role="dialog"], .mobile-menu, nav')).toBeVisible();
      
      // Click a nav item
      await page.click('text=Projects');
      await expect(page).toHaveURL('/projects');
      
      // Menu should close after navigation
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });
});