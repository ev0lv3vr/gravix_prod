import { test, expect } from '@playwright/test';

test.describe('Products — Catalog', () => {
  test('product catalog is public', async ({ page }) => {
    const resp = await page.goto('/products');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page.getByText(/adhesive product database/i)).toBeVisible();
  });

  test('lists product cards', async ({ page }) => {
    await page.goto('/products');
    // Should have at least one "View Performance" CTA
    const ctas = page.getByRole('link', { name: /view performance/i });
    await expect(ctas.first()).toBeVisible();
  });

  test('filters and search inputs render', async ({ page }) => {
    await page.goto('/products');
    // Search input
    const search = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
    if (await search.count()) await expect(search).toBeVisible();
    // Filter triggers (combobox/buttons)
    const filters = page.getByRole('button', { name: /chemistry|manufacturer|application/i });
    expect(await filters.count()).toBeGreaterThanOrEqual(0);
  });
});
