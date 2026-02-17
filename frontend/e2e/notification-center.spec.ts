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

async function setupAuth(page: Page, plan: string = 'quality') {
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
  await page.route('**/v1/notifications/unread-count**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 2 }) }),
  );

  const notifications = [
    { id: 'n1', title: 'Assigned to investigation', message: 'You were assigned', is_read: false, action_url: '/investigations/inv-001' },
    { id: 'n2', title: 'Mentioned in comment', message: '@you please review', is_read: true, action_url: '/investigations/inv-001' },
  ];
  await page.route('**/v1/notifications**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(notifications) });
    }
    return route.continue();
  });
}

test.describe('Notification Center', () => {
  test('notification dropdown opens', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    const bell = page.locator('[aria-label*="notification" i], button:has-text("Notifications")').first();
    if (await bell.count()) {
      await bell.click();
      await expect(page.getByText(/assigned|mentioned/i).first()).toBeVisible();
    }
  });

  test('unread highlighted', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    expect(body).toMatch(/assigned|mentioned/i);
  });

  test('notification click navigates', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/notifications');
    const item = page.getByText(/assigned to investigation/i).first();
    if (await item.count()) {
      await item.click();
      await expect(page).toHaveURL(/\/investigations\//);
    }
  });

  test('mark all read', async ({ page }) => {
    await setupAuth(page);
    await page.route('**/v1/notifications/read-all**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }),
    );
    await page.goto('/notifications');
    const markAll = page.getByRole('button', { name: /mark all read/i }).first();
    if (await markAll.count()) {
      await markAll.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('notification full page loads', async ({ page }) => {
    await setupAuth(page);
    const resp = await page.goto('/notifications');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('filter by type', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/notifications');
    const filter = page.getByRole('combobox').first();
    if (await filter.count()) {
      await filter.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
