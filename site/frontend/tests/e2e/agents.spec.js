import { expect, test } from '@playwright/test';

/**
 * The Testing AI Agents page. The advisor needs a local Ollama model, so in
 * CI it is off and the page must fall back to recorded answers.
 */
test.describe('Testing AI Agents page', () => {
  test('shows a recorded advisor conversation when the advisor is off', async ({ page }) => {
    await page.goto('/#/testing-ai-agents');
    await expect(page.getByRole('heading', { name: 'Testing an AI agent' })).toBeVisible();
    await expect(page.getByText('so it is off on this site')).toBeVisible();
    await expect(page.getByText('Try it live on your own machine')).toBeVisible();

    await page.getByRole('button', { name: 'No future prices given' }).click();
    await expect(page.getByText('I have 10 euros and the stocks cost 3, 4 and 5')).toBeVisible();
    await expect(page.getByText(/Judge \(gemma3:12b\)/)).toBeVisible();
  });

  test('explains a layer of the agent pyramid when it is selected', async ({ page }) => {
    await page.goto('/#/testing-ai-agents');
    await page.getByRole('button', { name: /Probabilistic performance/ }).click();
    await expect(page.getByText('How often does the agent get it right?', { exact: true })).toBeVisible();
  });
});
