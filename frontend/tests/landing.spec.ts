import { test, expect } from '@playwright/test';

test('landing page snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Products Manager/);
  await expect(page.getByRole('heading', { name: /Sell smarter/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Selling' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible();
  await expect(page).toHaveScreenshot('landing.png');
});
