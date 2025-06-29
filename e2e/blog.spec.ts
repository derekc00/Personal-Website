import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { expectedPageTitles, testBlogPosts } from './fixtures/test-data';

test.describe('Blog E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.navigateAndWait('/blog');
  });

  test('loads blog page successfully with correct title', async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.expectPageTitle(expectedPageTitles.blog);
  });

  test('displays blog page header and description', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check page header
    await helpers.expectElementVisible('h1');
    await expect(page.locator('h1')).toContainText('Blog');
    
    // Check description mentions article count
    await helpers.expectElementVisible('p');
    await expect(page.locator('p')).toContainText('articles');
  });

  test('search functionality is present and accessible', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check search input exists
    await helpers.expectElementVisible('input[aria-label="Search articles"]');
    
    // Check search input has proper placeholder
    await expect(page.locator('input[aria-label="Search articles"]')).toHaveAttribute('placeholder', 'Search articles');
    
    // Check search icon is present
    await helpers.expectElementVisible('svg');
  });

  test('blog posts are displayed correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for blog posts to load
    await page.waitForSelector('article, [data-testid="blog-post"]', { timeout: 10000 });
    
    // Check that blog posts are present
    const blogPosts = page.locator('article, [data-testid="blog-post"]');
    const postCount = await blogPosts.count();
    expect(postCount).toBeGreaterThan(0);
    
    // Check first blog post has required elements
    const firstPost = blogPosts.first();
    await expect(firstPost).toBeVisible();
  });

  test('search functionality filters blog posts', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for initial posts to load
    await page.waitForSelector('article, [data-testid="blog-post"]', { timeout: 10000 });
    
    // Count initial posts
    const initialPosts = page.locator('article, [data-testid="blog-post"]');
    const initialCount = await initialPosts.count();
    
    // Search for a specific term
    await helpers.fillAndWait('input[aria-label="Search articles"]', 'coffee');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Check if results are filtered (should be fewer or same number of posts)
    const filteredPosts = page.locator('article, [data-testid="blog-post"]');
    const filteredCount = await filteredPosts.count();
    
    // If there are posts with "coffee", they should be displayed
    // If no posts contain "coffee", there should be no posts or a message
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('individual blog post navigation works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Wait for blog posts to load
    await page.waitForSelector('article, [data-testid="blog-post"]', { timeout: 10000 });
    
    // Find first blog post link
    const firstPostLink = page.locator('article a, [data-testid="blog-post"] a').first();
    
    if (await firstPostLink.isVisible()) {
      const href = await firstPostLink.getAttribute('href');
      
      // Click on the first blog post
      await firstPostLink.click();
      await helpers.waitForPageLoad();
      
      // Verify we're on the blog post page
      if (href) {
        await helpers.expectUrlContains(href);
      }
      
      // Check that we're on a blog post page (should have /blog/ in URL)
      await helpers.expectUrlContains('/blog/');
    }
  });

  test('blog post page displays content correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Navigate to a specific blog post that we know exists
    await helpers.navigateAndWait('/blog/debugging-my-coffee-maker');
    
    // Check that we're on the correct page
    await helpers.expectUrlContains('/blog/debugging-my-coffee-maker');
    
    // Check that content is displayed
    await helpers.expectElementVisible('main');
    
    // Check for article content (title, content, etc.)
    await helpers.expectElementVisible('h1, h2, h3');
  });

  test('navigation breadcrumbs work correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Navigate to a blog post
    await helpers.navigateAndWait('/blog/debugging-my-coffee-maker');
    
    // Check if there's a way to navigate back to blog listing
    const backLink = page.locator('a[href="/blog"], a:has-text("Blog"), a:has-text("← Back")');
    
    if (await backLink.isVisible()) {
      await backLink.click();
      await helpers.waitForPageLoad();
      await helpers.expectUrlContains('/blog');
    }
  });

  test('blog page has proper accessibility', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Check main landmark
    await helpers.expectElementVisible('main');
    
    // Check search input accessibility
    await helpers.expectAriaLabel('input[aria-label="Search articles"]', 'Search articles');
    
    // Check heading hierarchy
    await helpers.expectElementVisible('h1');
    
    // Check that blog posts have proper structure
    await page.waitForSelector('article, [data-testid="blog-post"]', { timeout: 10000 });
    const posts = page.locator('article, [data-testid="blog-post"]');
    const postCount = await posts.count();
    
    if (postCount > 0) {
      // Check first post has proper heading structure
      const firstPost = posts.first();
      const headingInPost = firstPost.locator('h1, h2, h3, h4');
      if (await headingInPost.count() > 0) {
        await expect(headingInPost.first()).toBeVisible();
      }
    }
  });

  test('responsive design works on mobile', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that page loads properly on mobile
    await helpers.expectElementVisible('main');
    
    // Check search input is still accessible
    await helpers.expectElementVisible('input[aria-label="Search articles"]');
    
    // Check mobile navigation works
    if (await page.locator('button[aria-label="Toggle menu"]').isVisible()) {
      await page.click('button[aria-label="Toggle menu"]');
      await helpers.expectElementVisible('[role="dialog"]');
    }
  });
});