import { test, expect, type Page } from '@playwright/test';

async function setupQualityAuth(page: Page) {
  await page.addInitScript(() => {
    (window as any).__GRAVIX_TEST_SESSION__ = { user: { id: '00000000-0000-0000-0000-000000000001', email: 'quality@test.com' } };
  });
  await page.route('**/users/me**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'quality@test.com', plan: 'quality' }) }),
  );
}

test.describe('Settings Updates', () => {
  test('settings page loads', async ({ page }) => {
    await setupQualityAuth(page);
    const resp = await page.goto('/settings');
    expect(resp?.status()).toBeLessThan(500);
  });

  test('subscription section present', async ({ page }) => {
    await setupQualityAuth(page);
    await page.goto('/settings');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    if (body) expect(body).toMatch(/subscription|plan|seats/i);
  });
});
