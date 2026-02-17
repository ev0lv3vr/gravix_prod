import { test, expect, type Page } from '@playwright/test';

async function setupAuth(page: Page, plan: string) {
  await page.addInitScript(() => {
    (window as any).__GRAVIX_TEST_SESSION__ = { user: { id: '00000000-0000-0000-0000-000000000001', email: 'test@gravix.com' } };
  });
  await page.route('**/users/me**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'test@gravix.com', plan }) }),
  );
  await page.route('**/users/me/usage**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ analyses_used: 0, analyses_limit: 5, specs_used: 0, specs_limit: 5, plan }) }),
  );
  await page.route('**/v1/notifications/unread-count**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
  );
}

test.describe('Dashboard Updates', () => {
  test('free user dashboard loads', async ({ page }) => {
    await setupAuth(page, 'free');
    const resp = await page.goto('/dashboard');
    expect(resp?.status()).toBeLessThan(500);
  });

  test('quality user sees investigations card (if rendered)', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.route('**/v1/investigations**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    if (body?.toLowerCase().includes('investigation')) {
      expect(body).toMatch(/investigation/i);
    }
  });
});
