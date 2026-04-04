import { test, expect } from '@playwright/test';

test('customer orders page snapshot', async ({ page }) => {
  // Inject auth token via sessionStorage before navigating to the orders page
  await page.goto('/customer/login');

  await page.evaluate(() => {
    const authData = {
      state: {
        accessToken: 'mock-token-for-snapshot',
        userType: 'customer',
        userId: 'mock-customer-id',
      },
      version: 0,
    };
    sessionStorage.setItem('auth-storage', JSON.stringify(authData));
  });

  // Mock the orders API so the page renders without a real backend
  await page.route('**/orders/for-customers**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orders: [
          {
            id: 'order-snapshot-1',
            status: 'Pending',
            total_price: 49.99,
            products: [
              {
                id: 'prod-1',
                name: 'Snapshot Widget',
                description: 'A widget for snapshot testing.',
                price: 24.99,
                image_url: null,
                seller_name: 'Test Seller',
                category: 'Electronics',
              },
            ],
          },
          {
            id: 'order-snapshot-2',
            status: 'Approved',
            total_price: 99.0,
            products: [],
          },
        ],
        total_orders: 2,
        skipped_orders: 0,
        remaining_orders: 0,
        hasNextPage: false,
      }),
    });
  });

  await page.goto('/customer/orders');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveScreenshot('customer-orders.png');
});
