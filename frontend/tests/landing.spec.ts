import { test, expect } from '@playwright/test';

test('landing page snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Products Manager/);
  await expect(page.getByRole('heading', { name: 'Products Manager' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter as Seller' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter as Customer' })).toBeVisible();
  await expect(page).toHaveScreenshot('landing.png');
});
