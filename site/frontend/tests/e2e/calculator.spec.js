import { test, expect } from '@playwright/test';

/**
 * End-to-end UI tests for the Max Profit Calculator.
 *
 * Drives the real production React bundle (not the API directly) through
 * a headless Chromium — exactly how a user would interact with the
 * calculator page — and verifies the visible result.
 *
 * Run with:
 *   npm run test:ui            # list reporter
 *   npm run test:ui:report    # HTML reporter (writes to playwright-report/)
 */
test.describe('Max Profit Calculator UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/calculator');
    // Wait for the form to hydrate before touching it. The dev server /
    // first load can take a few seconds in CI.
    await expect(page.locator('#savings-amount')).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test('calculates max profit for the default sample data', async ({ page }) => {
    // Default form already has three rows with savings=10, buy=[5,5,10],
    // sell=[15,10,35]. Stock #2 (buy=10, sell=35) is the unique
    // max-profit pick and exactly fits the savings.
    await page.fill('#savings-amount', '10');
    await page
      .locator("input[type='number'][aria-label*='Buy price']")
      .nth(0)
      .fill('5');
    await page
      .locator("input[type='number'][aria-label*='Buy price']")
      .nth(1)
      .fill('5');
    await page
      .locator("input[type='number'][aria-label*='Buy price']")
      .nth(2)
      .fill('10');
    await page
      .locator("input[type='number'][aria-label*='Sell price']")
      .nth(0)
      .fill('15');
    await page
      .locator("input[type='number'][aria-label*='Sell price']")
      .nth(1)
      .fill('10');
    await page
      .locator("input[type='number'][aria-label*='Sell price']")
      .nth(2)
      .fill('35');

    await page.click("button[type='submit']");

    // The Max Profit tile reads `€<value>`. €25 confirms stock #2 was picked.
    const maxProfit = page.locator('.text-green-400').first();
    await expect(maxProfit).toBeVisible();
    await expect(maxProfit).toContainText('€25');
  });

  test('rejects invalid input with a validation banner', async ({ page }) => {
    // Savings must be 1–1000. Setting it to 0 should keep the submit
    // button enabled but block the API call and show a banner — this
    // exercises the form validation path end-to-end.
    await page.fill('#savings-amount', '0');
    await page.click("button[type='submit']");
    await expect(page.locator('#savings-error')).toBeVisible();
    await expect(page.locator('#savings-error')).toContainText('Savings');
  });

  test('navigates to the calculator from the home page', async ({ page }) => {
    // The home page links to /#/calculator. Following that link from a
    // cold start verifies HashRouter routing works for a real user.
    await page.goto('/');
    await page.click('text=Calculator');
    await expect(page).toHaveURL(/calculator/);
    await expect(page.locator('#savings-amount')).toBeVisible();
  });
});
