import { defineConfig, devices } from '@playwright/test';

// Configuration for the e2e UI tests. Run with:
//   npm run test:ui              # default list reporter
//   npm run test:ui:report      # HTML reporter, writes to playwright-report/
//
// The HTML reporter writes a fully self-contained static bundle
// (playwright-report/index.html) with per-test traces, screenshots,
// network logs, and the same interactive UI as the official
// Playwright HTML reporter used by the Node.js Playwright Test runner.
export default defineConfig({
  // Where the e2e specs live.
  testDir: './tests/e2e',

  // Match the Maven build: default Chromium, headless, no-sandbox.
  // `--no-sandbox` is required when running inside a Docker container
  // as root (GitHub Actions runners). Locally on macOS it has no effect.
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox'],
        },
      },
    },
  ],

  // Run serially. The calculator page is single-user so there is no
  // parallelism benefit, and serial avoids the React dev-server
  // rate-limiter firing under concurrent requests.
  fullyParallel: false,
  workers: 1,
  retries: 0,

  // Where the static HTML report goes. The reports workflow copies
  // playwright-report/ into site/frontend/public/playwright-report/
  // so it ships as part of the static bundle.
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
      title: 'Max Profit Calculator — UI tests',
    }],
  ],

  // The frontend is served from vite preview at :4173 in CI
  // (PLAYWRIGHT_BASE_URL) and from vite dev at :5173 locally
  // (npm run dev). Default to the vite preview URL since that's
  // what CI runs against.
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Give the page a chance to hydrate before the first action.
  timeout: 30_000,
});
