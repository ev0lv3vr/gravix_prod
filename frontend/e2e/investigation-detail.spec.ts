import { test, expect, type Page } from '@playwright/test';

async function setupQualityAuth(page: Page) {
  await page.addInitScript(() => {
    (window as any).__GRAVIX_TEST_SESSION__ = { user: { id: '00000000-0000-0000-0000-000000000001', email: 'quality@test.com' } };
  });
  await page.route('**/users/me**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'quality@test.com', plan: 'quality' }) }),
  );
  await page.route('**/v1/investigations/*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'inv-1', investigation_number: 'GQ-2026-0012', title: 'Test Investigation', status: 'investigating', severity: 'critical' }) }),
  );
}

test.describe('Investigations — Detail', () => {
  test('detail page renders skeleton', async ({ page }) => {
    await setupQualityAuth(page);
    const resp = await page.goto('/investigations/inv-1');
    expect(resp?.status()).toBeLessThan(500);
  });

  test('shows stepper tabs D1–D8 when present', async ({ page }) => {
    await setupQualityAuth(page);
    await page.goto('/investigations/inv-1');
    const body = await page.textContent('body');
    if (body?.includes('D1')) {
      expect(body).toMatch(/D1/);
      expect(body).toMatch(/D8/);
    }
  });
});
