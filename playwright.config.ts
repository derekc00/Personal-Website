import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: [
    '**/journeys/*.journey.spec.ts',
    '**/critical-paths/*.critical.spec.ts'
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
    ['line']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    // Desktop browsers (most important)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Firefox browser
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    // Run critical tests on Firefox (additional project)
    {
      name: 'firefox-critical',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/critical-paths/*.critical.spec.ts',
    },
    
    // WebKit browser (Safari)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing for journey tests only
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/journeys/*.journey.spec.ts',
    },
  ],

  webServer: {
    command: process.env.CI ? 'npm run build && npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});