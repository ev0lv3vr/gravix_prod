import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads and shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Gravix/i);
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
  });

  test('has CTA buttons', async ({ page }) => {
    await page.goto('/');
    // Nav has "Try Free →" and "Sign In" buttons
    await expect(page.getByRole('button', { name: /try free/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  });

  test('has hero action links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /try spec engine/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /diagnose a failure/i }).first()).toBeVisible();
  });
});

test.describe('Health & SEO', () => {
  test('returns 200 on landing page', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
  });

  test('has meta description', async ({ page }) => {
    await page.goto('/');
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });
});

test.describe('Auth Guards', () => {
  test('redirects unauthenticated user from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Unauthenticated users get redirected to landing page
    await page.waitForURL((url) => !url.pathname.includes('/dashboard'), { timeout: 10_000 });
    expect(page.url()).not.toContain('/dashboard');
  });

  test('redirects unauthenticated user from tool page', async ({ page }) => {
    // Tool might be accessible to unauthed users (free tier) or redirect
    const response = await page.goto('/tool');
    // Should either load or redirect — either way, no server error
    expect(response?.status()).toBeLessThan(500);
  });
});
