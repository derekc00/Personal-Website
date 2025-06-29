import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForHydration() {
    // Wait for Next.js hydration to complete
    await this.page.waitForFunction(() => {
      return (window as any).next?.router?.isReady;
    }, { timeout: 10000 }).catch(() => {
      // Fallback: wait for React hydration
      return this.page.waitForFunction(() => {
        return document.querySelector('[data-reactroot]') !== null;
      }, { timeout: 5000 }).catch(() => {
        // Final fallback: wait for DOM ready
        return this.page.waitForLoadState('domcontentloaded');
      });
    });
  }

  async expectPageTitle(title: string) {
    await expect(this.page).toHaveTitle(title);
  }

  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementCount(selector: string, count: number) {
    await expect(this.page.locator(selector)).toHaveCount(count);
  }

  async expectUrlContains(urlPart: string) {
    await expect(this.page).toHaveURL(new RegExp(urlPart));
  }

  async navigateAndWait(url: string) {
    await this.page.goto(url);
    await this.waitForPageLoad();
    await this.waitForHydration();
  }

  async clickAndWait(selector: string) {
    await this.page.click(selector);
    await this.waitForPageLoad();
    await this.waitForHydration();
  }

  async fillAndWait(selector: string, value: string) {
    await this.page.fill(selector, value);
    await this.page.waitForTimeout(500); // Allow for debounced inputs
  }

  async expectAccessibleName(selector: string, name: string) {
    await expect(this.page.locator(selector)).toHaveAccessibleName(name);
  }

  async expectAriaLabel(selector: string, label: string) {
    await expect(this.page.locator(selector)).toHaveAttribute('aria-label', label);
  }
}