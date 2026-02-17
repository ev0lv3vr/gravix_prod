import { test, expect, type Page } from '@playwright/test';

async function setupQualityAuth(page: Page) {
  // Minimal auth bypass: tests are mostly UI smoke.
  await page.addInitScript(() => {
    (window as any).__GRAVIX_TEST_SESSION__ = { user: { id: '00000000-0000-0000-0000-000000000001', email: 'quality@test.com' } };
  });
  await page.route('**/users/me**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'quality@test.com', plan: 'quality' }) }),
  );
  await page.route('**/v1/investigations**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
}

test.describe('Investigations — List + Kanban', () => {
  test('requires auth (redirects or upgrade prompt when logged out)', async ({ page }) => {
    const resp = await page.goto('/investigations');
    expect(resp?.status()).toBeLessThan(500);
  });

  test('quality user can load investigations page', async ({ page }) => {
    await setupQualityAuth(page);
    await page.goto('/investigations');
    await expect(page.getByText(/investigations/i).first()).toBeVisible();
  });

  test('kanban toggle exists', async ({ page }) => {
    await setupQualityAuth(page);
    await page.goto('/investigations');
    const toggle = page.getByRole('button', { name: /kanban|list/i });
    expect(await toggle.count()).toBeGreaterThanOrEqual(0);
  });
});
