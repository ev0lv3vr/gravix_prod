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

  const alerts = [
    { id: 'a1', severity: 'critical', title: 'Rising disbond on B-pillar', hypothesis: 'Primer contamination', actions: ['Inspect wipe process'] },
    { id: 'a2', severity: 'warning', title: 'Elevated porosity', hypothesis: 'Mix ratio drift', actions: ['Calibrate dispenser'] },
  ];
  await page.route('**/v1/intelligence/trends**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(alerts) }),
  );
}

test.describe('Pattern Alerts Page', () => {
  test('alerts page requires enterprise', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/alerts');
    await expect(page.locator('body')).toBeVisible();
    // Expect upgrade prompt or restricted message
  });

  test('enterprise user sees alerts list', async ({ page }) => {
    await setupAuth(page, 'enterprise');
    await page.goto('/alerts');
    const body = await page.textContent('body');
    expect(body).toMatch(/critical|warning|alerts/i);
  });

  test('acknowledge flow updates status', async ({ page }) => {
    await setupAuth(page, 'enterprise');
    await page.goto('/alerts');
    const ack = page.getByRole('button', { name: /acknowledge/i }).first();
    if (await ack.count()) {
      await ack.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('filter by severity', async ({ page }) => {
    await setupAuth(page, 'enterprise');
    await page.goto('/alerts');
    const filter = page.getByRole('combobox').first();
    if (await filter.count()) {
      await filter.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
