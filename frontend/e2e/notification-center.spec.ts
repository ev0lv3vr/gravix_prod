import { test, expect, type Page } from '@playwright/test';

async function setupAuth(page: Page) {
  await page.addInitScript(() => {
    (window as any).__GRAVIX_TEST_SESSION__ = { user: { id: '00000000-0000-0000-0000-000000000001', email: 'pro@test.com' } };
  });
  await page.route('**/users/me**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'pro@test.com', plan: 'pro' }) }),
  );
  await page.route('**/v1/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/v1/notifications/unread-count**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
  );
}

test.describe('Notifications', () => {
  test('notifications page requires auth but loads', async ({ page }) => {
    await setupAuth(page);
    const resp = await page.goto('/notifications');
    expect(resp?.status()).toBeLessThan(500);
  });

  test('shows notifications header', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/notifications');
    await expect(page.getByText(/notifications/i).first()).toBeVisible();
  });
});
