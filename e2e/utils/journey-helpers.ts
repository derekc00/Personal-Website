import { Page, expect } from '@playwright/test';

export class JourneyHelpers {
  constructor(private page: Page) {}

  async navigateToSection(section: 'blog' | 'projects' | 'about' | 'content') {
    // Check if mobile menu is needed
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      await this.openMobileMenu();
      // Extra wait for mobile menu animation
      await this.page.waitForTimeout(200);
    }
    
    // Try multiple selectors for navigation links
    const linkText = section.charAt(0).toUpperCase() + section.slice(1);
    const linkSelectors = [
      `nav a[href="/${section}"]`,
      `[role="dialog"] a[href="/${section}"]`,
      `a[href="/${section}"]:visible`,
      `a:has-text("${linkText}"):visible`,
      `text="${linkText}"`
    ];
    
    let clicked = false;
    for (const selector of linkSelectors) {
      try {
        const link = this.page.locator(selector).first();
        if (await link.isVisible({ timeout: 1000 })) {
          await link.click();
          clicked = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!clicked) {
      // Log what elements are visible for debugging
      const visibleLinks = await this.page.locator('a:visible').all();
      const hrefs = await Promise.all(visibleLinks.map(l => l.getAttribute('href')));
      throw new Error(`Could not find navigation link for ${section}. Visible links: ${hrefs.join(', ')}`);
    }
    
    await this.page.waitForURL(`/${section}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchFor(term: string) {
    const searchInput = this.page.locator('input[aria-label*="Search"], input[placeholder*="Search"]').first();
    await searchInput.fill(term);
    await this.page.waitForTimeout(500); // Debounce
  }

  async clickFirstResult() {
    const firstResult = this.page.locator('article, .rounded-xl.border.bg-card').first();
    const link = firstResult.locator('a').first();
    await link.click();
  }

  async expectContentVisible() {
    await expect(this.page.locator('main')).toBeVisible();
    await expect(this.page.locator('h1, h2, h3').first()).toBeVisible();
  }

  async toggleTheme() {
    const themeButton = this.page.locator('button[aria-label*="theme"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
    await themeButton.click();
    await this.page.waitForTimeout(100); // Animation
  }

  async openMobileMenu() {
    // First check if menu is already open
    const menuSelectors = [
      '[role="dialog"]',
      '.mobile-menu',
      'nav[aria-label="Mobile navigation"]',
      '[data-state="open"]'
    ];
    
    for (const selector of menuSelectors) {
      if (await this.page.locator(selector).isVisible()) {
        // Menu is already open
        return;
      }
    }
    
    // Try to open the menu
    const menuButton = this.page.locator('button[aria-label="Toggle menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Wait for menu to open
      await this.page.waitForTimeout(300);
      
      // Verify menu opened
      for (const selector of menuSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          await expect(this.page.locator(selector).first()).toBeVisible();
          break;
        }
      }
    }
  }

  async filterByCategory(category: string) {
    const filterButton = this.page.locator(`button:has-text("${category}")`).first();
    await filterButton.click();
    await this.page.waitForTimeout(300); // Animation
  }

  async verifyImageLoaded(selector = 'img') {
    const image = this.page.locator(selector).first();
    await expect(image).toBeVisible();
    
    const isLoaded = await image.evaluate((img: HTMLImageElement) => 
      img.complete && img.naturalWidth > 0
    );
    
    expect(isLoaded).toBeTruthy();
  }

  async measureLoadTime() {
    const startTime = Date.now();
    await this.page.waitForLoadState('domcontentloaded');
    return Date.now() - startTime;
  }
}