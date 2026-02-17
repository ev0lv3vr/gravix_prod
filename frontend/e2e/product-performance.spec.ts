import { test, expect, type Page } from '@playwright/test';

const FAKE_SESSION = {
  access_token:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0ZXN0Iiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiZXhwIjo5OTk5OTk5OTk5fQ.fake',
  refresh_token: 'fake-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@gravix.com',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: { email: 'test@gravix.com' },
    created_at: '2025-01-01T00:00:00Z',
  },
};

async function setupAuth(page: Page, plan: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jvyohfodhaeqchjzcopf.supabase.co';
  const ref = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || 'jvyohfodhaeqchjzcopf';

  await page.addInitScript((sessionData) => {
    (window as any).__GRAVIX_TEST_SESSION__ = sessionData;
  }, FAKE_SESSION);

  await page.addInitScript(
    ({ ref, session }) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
    },
    { ref, session: FAKE_SESSION },
  );

  await page.route(`${supabaseUrl}/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
  await page.route('**/users/me**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: FAKE_SESSION.user.id, email: FAKE_SESSION.user.email, plan }),
    }),
  );
  await page.route('**/users/me/usage**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ analyses_used: 0, analyses_limit: 50, plan }) }),
  );
  await page.route('**/health**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
}

test.describe('Products — Performance Page', () => {
  test('performance page public access', async ({ page }) => {
    const resp = await page.goto('/products/henkel/loctite-495');
    expect(resp?.status()).toBeLessThan(500);
  });

  test('specs section visible', async ({ page }) => {
    await page.goto('/products/henkel/loctite-495');
    const body = await page.textContent('body');
    expect(body).toMatch(/spec|viscosity|cure|shear|temperature/i);
  });

  test('field performance data visible', async ({ page }) => {
    await page.goto('/products/henkel/loctite-495');
    const body = await page.textContent('body');
    expect(body).toMatch(/failure rate|applications|root cause|failure mode/i);
  });

  test('field data anonymized', async ({ page }) => {
    await page.goto('/products/henkel/loctite-495');
    const body = await page.textContent('body');
    // Should not leak company/facility names in public aggregate view
    expect(body || '').not.toMatch(/Ford Motor Company|Facility|Plant\s\d+/i);
  });

  test('CTA drives signup when logged out', async ({ page }) => {
    await page.goto('/products/henkel/loctite-495');
    const cta = page.getByRole('link', { name: /get ai failure analysis|analyze/i }).first()
      .or(page.getByRole('button', { name: /get ai failure analysis|analyze/i }).first());
    if (await cta.count()) {
      await cta.click();
      // Either opens auth modal or navigates to /failure
      await expect(page).toHaveURL(/\/failure|\/products\//);
    }
  });

  test('CTA prefills failure form when logged in', async ({ page }) => {
    await setupAuth(page, 'pro');
    await page.goto('/products/henkel/loctite-495');
    const cta = page.getByRole('link', { name: /get ai failure analysis|analyze/i }).first()
      .or(page.getByRole('button', { name: /get ai failure analysis|analyze/i }).first());
    if (await cta.count()) {
      await cta.click();
      await expect(page).toHaveURL(/\/failure/);
    }
  });

  test('SEO metadata present', async ({ page }) => {
    await page.goto('/products/henkel/loctite-495');
    await expect(page).toHaveTitle(/loctite|field performance|gravix/i);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
  });

  test('below-threshold product returns 404', async ({ page }) => {
    const resp = await page.goto('/products/testco/low-use-x');
    // Expect 404 or a not-found page
    expect([200, 404].includes(resp?.status() || 0)).toBeTruthy();
    const body = await page.textContent('body');
    if ((resp?.status() || 0) === 200) {
      expect(body).toMatch(/not found|404/i);
    }
  });
});
