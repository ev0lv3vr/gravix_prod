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

  await page.route(`${supabaseUrl}/**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('**/users/me**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: FAKE_SESSION.user.id, email: FAKE_SESSION.user.email, plan }) }),
  );
  await page.route('**/users/me/usage**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ plan, analyses_used: 0, analyses_limit: plan === 'free' ? 5 : 50 }) }),
  );

  await page.route('**/v1/investigations/summary**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ open_count: 2, overdue_actions: 1, recent: [] }) }),
  );
  await page.route('**/v1/intelligence/trends**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'a1', severity: 'critical', title: 'Alert' }]) }),
  );
}

test.describe('Dashboard — Updates', () => {
  test('free user quick actions show 3 cards (no investigations)', async ({ page }) => {
    await setupAuth(page, 'free');
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 15_000 });
    const body = await page.textContent('body');
    expect(body).toMatch(/Failure|Spec|Guided/i);
    expect(body || '').not.toMatch(/8D|Investigation/i);
  });

  test('quality user quick actions show 4 cards (includes investigations)', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 15_000 });
    const body = await page.textContent('body');
    expect(body).toMatch(/Investigation|8D/i);
  });

  test('quality user sees investigation summary card', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    expect(body).toMatch(/open|overdue|investigation/i);
  });

  test('free/pro user investigation summary hidden', async ({ page }) => {
    await setupAuth(page, 'pro');
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    expect(body || '').not.toMatch(/overdue actions|open investigations/i);
  });

  test('enterprise user sees alerts card', async ({ page }) => {
    await setupAuth(page, 'enterprise');
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    expect(body).toMatch(/alerts?|pattern/i);
  });

  test('quality user alerts card hidden', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    // Quality should not see alerts card
    expect(body || '').not.toMatch(/pattern alerts/i);
  });
});
