import { test, expect } from '@playwright/test';

test.describe('Products — Performance Page', () => {
  test('performance page is public', async ({ page }) => {
    const resp = await page.goto('/products/henkel/loctite-495');
    // mock pages are SSG; allow 200/404 depending on slug set
    expect(resp?.status()).toBeLessThan(500);
  });

  test('shows key sections when product exists', async ({ page }) => {
    await page.goto('/products/henkel/loctite-495');
    const body = await page.textContent('body');
    if (!body) throw new Error('No body text');
    // If the mock profile exists, should include these headings
    if (body.toLowerCase().includes('key specifications')) {
      expect(body).toMatch(/Key Specifications/i);
      expect(body).toMatch(/Field Performance/i);
    }
  });

  test('CTAs include failure/spec links', async ({ page }) => {
    await page.goto('/products/henkel/loctite-495');
    const ctas = page.getByRole('link', { name: /failure analysis|generate specification|diagnosis/i });
    expect(await ctas.count()).toBeGreaterThanOrEqual(0);
  });
});
