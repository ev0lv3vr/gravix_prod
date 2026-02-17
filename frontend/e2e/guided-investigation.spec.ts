import { test, expect } from '@playwright/test';

test.describe('Guided Investigation', () => {
  test('guided mode loads chat UI', async ({ page }) => {
    const resp = await page.goto('/failure?mode=guided');
    expect(resp?.status()).toBeLessThan(500);
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    // Chat-like copy
    if (body) expect(body).toMatch(/guided|investigation|help you diagnose/i);
  });
});
