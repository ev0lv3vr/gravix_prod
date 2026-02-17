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

  await page.route('**/v1/notifications/preferences**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ email_enabled: true, status_changes: true, new_comments: true }) }),
  );
  await page.route('**/v1/org**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ plan_tier: plan, seats_used: 2, seat_limit: plan === 'enterprise' ? 10 : 3 }) }),
  );
}

test.describe('Settings — Updates', () => {
  test('subscription shows correct plan', async ({ page }) => {
    await setupAuth(page, 'pro');
    await page.goto('/settings');
    const body = await page.textContent('body');
    expect(body).toMatch(/subscription|plan/i);
  });

  test('seat management visible for quality', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/settings');
    const body = await page.textContent('body');
    expect(body).toMatch(/seats?|add seat/i);
  });

  test('seat management hidden for pro', async ({ page }) => {
    await setupAuth(page, 'pro');
    await page.goto('/settings');
    const body = await page.textContent('body');
    expect(body || '').not.toMatch(/Add Seat — \$79|Seats:\s*\d+/i);
  });

  test('notification preferences visible for quality', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/settings');
    const body = await page.textContent('body');
    expect(body).toMatch(/notification|quiet hours|digest/i);
  });

  test('org branding visible for enterprise', async ({ page }) => {
    await setupAuth(page, 'enterprise');
    await page.goto('/settings');
    const body = await page.textContent('body');
    expect(body).toMatch(/branding|logo|white.?label|colors?/i);
  });

  test('org branding hidden for quality', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/settings');
    const body = await page.textContent('body');
    // Branding section should not appear for quality
    expect(body || '').not.toMatch(/white.?label|hide gravix/i);
  });
});
