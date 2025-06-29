# E2E Testing Guide

This document provides comprehensive guidance for running, writing, and maintaining End-to-End (E2E) tests using Playwright.

## Quick Start

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (visual mode)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# View test reports
npm run test:e2e:report
```

### Prerequisites

1. **Application must be built**: E2E tests run against the production build
   ```bash
   npm run build
   ```

2. **Dependencies installed**: Playwright browsers should be installed
   ```bash
   npx playwright install
   ```

## Test Structure

### Directory Organization

```
e2e/
├── fixtures/           # Test data and mock objects
│   └── test-data.ts
├── utils/              # Helper utilities and page objects
│   └── test-helpers.ts
├── homepage.spec.ts    # Homepage E2E tests
├── blog.spec.ts        # Blog functionality tests
└── content-discovery.spec.ts  # Content filtering and search tests
```

### Test Categories

#### 1. Homepage Tests (`homepage.spec.ts`)
- Video background loading
- Typewriter animation
- Navigation functionality
- Mobile responsiveness
- Theme switching
- Accessibility compliance

#### 2. Blog Tests (`blog.spec.ts`)
- Blog listing display
- Search functionality
- Individual blog post navigation
- Responsive design
- Accessibility features

#### 3. Content Discovery Tests (`content-discovery.spec.ts`)
- Content filtering by category
- Search functionality
- Combined filter + search
- Load more pagination
- Empty state handling

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Feature Name E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.navigateAndWait('/your-page');
  });

  test('should perform expected behavior', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Your test logic here
    await helpers.expectElementVisible('selector');
    await helpers.clickAndWait('button');
    await helpers.expectUrlContains('/expected-path');
  });
});
```

### Test Helpers

The `TestHelpers` class provides common functionality:

```typescript
const helpers = new TestHelpers(page);

// Navigation and waiting
await helpers.navigateAndWait('/path');
await helpers.waitForPageLoad();
await helpers.waitForHydration();

// Interactions
await helpers.clickAndWait('selector');
await helpers.fillAndWait('input', 'value');

// Assertions
await helpers.expectElementVisible('selector');
await helpers.expectElementCount('selector', 5);
await helpers.expectPageTitle('Expected Title');
await helpers.expectUrlContains('/path');

// Accessibility
await helpers.expectAccessibleName('button', 'Button Name');
await helpers.expectAriaLabel('input', 'Input Label');
```

### Test Data

Use the fixtures for consistent test data:

```typescript
import { testBlogPosts, expectedPageTitles } from './fixtures/test-data';

// Use predefined data
await helpers.expectPageTitle(expectedPageTitles.blog);

# Check for specific blog post
const coffeePost = testBlogPosts.find(post => post.slug === 'debugging-my-coffee-maker');
```

## Best Practices

### 1. Wait Strategies

```typescript
// ✅ Good - Wait for specific conditions
await page.waitForSelector('[data-testid="content-loaded"]');
await page.waitForLoadState('networkidle');

// ❌ Avoid - Arbitrary timeouts
await page.waitForTimeout(5000);
```

### 2. Selectors

```typescript
// ✅ Good - Semantic selectors
await page.click('button[aria-label="Submit form"]');
await page.locator('[data-testid="blog-post"]');

// ✅ Good - Text-based selectors
await page.click('text="Load More"');

// ❌ Avoid - Fragile CSS selectors
await page.click('.btn.btn-primary.mx-4');
```

### 3. Assertions

```typescript
// ✅ Good - Auto-waiting assertions
await expect(page.locator('h1')).toContainText('Welcome');
await expect(page).toHaveURL(/\/blog/);

// ❌ Avoid - Non-waiting assertions
expect(await page.locator('h1').textContent()).toBe('Welcome');
```

### 4. Test Independence

```typescript
// ✅ Good - Each test is independent
test.beforeEach(async ({ page }) => {
  await page.goto('/clean-state');
});

// ❌ Avoid - Tests depending on each other
test('first test', async ({ page }) => {
  // Sets up state for next test
});
```

## Cross-Browser Testing

Tests run on multiple browsers automatically:
- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

To run tests on specific browsers:

```bash
# Single browser
npx playwright test --project=chromium

# Multiple browsers
npx playwright test --project=chromium --project=firefox
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

The CI pipeline includes:
1. **Unit/Integration Tests** - Must pass before E2E tests
2. **E2E Tests** - Run on all browsers in parallel
3. **Performance Tests** - Lighthouse audits
4. **Security Scans** - Dependency and vulnerability checks

### Artifacts

Test results and reports are uploaded as artifacts:
- Test results (`test-results/`)
- Playwright HTML report (`playwright-report/`)
- Screenshots and videos (on failure)

## Debugging

### Visual Debugging

```bash
# Open Playwright UI
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Debug specific test
npx playwright test homepage.spec.ts --debug
```

### Screenshots and Videos

Configured to capture on failure:
- Screenshots: Automatically taken on test failure
- Videos: Recorded and saved when tests fail
- Traces: Captured on first retry

### Browser DevTools

```typescript
// Add to test for debugging
await page.pause(); // Pauses execution and opens browser
```

## Performance Considerations

### Test Execution Speed

- Tests run in parallel by default
- Use `test.describe.serial()` only when tests must run sequentially
- Minimize network requests with proper mocking

### Resource Management

```typescript
// Clean up resources
test.afterEach(async ({ page }) => {
  await page.close();
});
```

## Common Patterns

### Page Object Model

```typescript
// utils/page-objects/blog-page.ts
export class BlogPage {
  constructor(private page: Page) {}
  
  async searchPosts(query: string) {
    await this.page.fill('[aria-label="Search articles"]', query);
    await this.page.waitForTimeout(500);
  }
  
  async expectPostCount(count: number) {
    await expect(this.page.locator('[data-testid="blog-post"]')).toHaveCount(count);
  }
}

// In tests
const blogPage = new BlogPage(page);
await blogPage.searchPosts('coffee');
await blogPage.expectPostCount(1);
```

### Conditional Logic

```typescript
// Handle optional elements
const loadMoreButton = page.locator('button:has-text("Load More")');
if (await loadMoreButton.isVisible()) {
  await loadMoreButton.click();
}
```

### Form Testing

```typescript
// Comprehensive form testing
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('textarea[name="message"]', 'Test message');
await page.click('button[type="submit"]');

await expect(page.locator('.success-message')).toBeVisible();
```

## Maintenance

### Updating Tests

1. **Keep selectors up-to-date** with UI changes
2. **Update test data** when content changes
3. **Review and update assertions** for new features
4. **Add tests for new user flows** as features are added

### Monitoring

- Review test results in CI/CD
- Update flaky tests promptly
- Monitor test execution time
- Keep browser versions updated

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in `playwright.config.ts`
   - Use proper wait strategies
   - Check for network issues

2. **Flaky tests**
   - Add proper waits
   - Use auto-waiting assertions
   - Check for race conditions

3. **Element not found**
   - Verify selector is correct
   - Check if element is in viewport
   - Ensure element is not hidden

### Getting Help

1. Check Playwright documentation: https://playwright.dev/
2. Review test failures in CI artifacts
3. Use browser DevTools for debugging
4. Add logging to understand test flow

---

## Test Coverage Goals

- **Critical User Flows**: 100% coverage ✅
- **Cross-Browser Compatibility**: All major browsers ✅  
- **Mobile Responsiveness**: Phone and tablet viewports ✅
- **Accessibility**: WCAG compliance checks ✅
- **Performance**: Core Web Vitals monitoring ✅

**Phase 3 Status**: ✅ **COMPLETE** - E2E Testing Framework Implemented