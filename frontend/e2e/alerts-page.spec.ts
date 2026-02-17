import { test, expect, type Page } from '@playwright/test';

async function setupEnterpriseAuth(page: Page) {
  await page.addInitScript(() => {
    (window as any).__GRAVIX_TEST_SESSION__ = { user: { id: '00000000-0000-0000-0000-000000000001', email: 'ent@test.com' } };
  });
  await page.route('**/users/me**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'ent@test.com', plan: 'enterprise' }) }),
  );
  await page.route('**/v1/alerts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
}

test.describe('Pattern Alerts', () => {
  test('alerts page loads for enterprise', async ({ page }) => {
    await setupEnterpriseAuth(page);
    const resp = await page.goto('/alerts');
    expect(resp?.status()).toBeLessThan(500);
  });
});
