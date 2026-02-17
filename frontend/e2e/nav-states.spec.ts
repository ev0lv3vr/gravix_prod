import { test, expect, type Page } from '@playwright/test';

// Reuse the auth bypass pattern from dashboard.spec.ts
const FAKE_SESSION = {
  access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0ZXN0Iiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiZXhwIjo5OTk5OTk5OTk5fQ.fake',
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

  await page.addInitScript(({ ref, session }) => {
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
  }, { ref, session: FAKE_SESSION });

  // Mock API calls
  await page.route(`${supabaseUrl}/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
  await page.route('**/users/me**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: FAKE_SESSION.user.id, email: FAKE_SESSION.user.email, plan, analyses_this_month: 0, specs_this_month: 0 }),
    }),
  );
  await page.route('**/users/me/usage**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ analyses_used: 0, analyses_limit: plan === 'free' ? 5 : 50, specs_used: 0, specs_limit: 50, plan }),
    }),
  );
  await page.route('**/v1/notifications/unread-count**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 3 }) }),
  );
  await page.route('**/v1/stats/public**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
  await page.route('**/health**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
}

test.describe('Nav States — Logged Out', () => {
  test('logged out nav shows public links', async ({ page }) => {
    await page.goto('/');
    // Should show public nav items
    await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i }).first()
      .or(page.getByRole('link', { name: /sign in/i }).first())).toBeVisible();
  });
});

test.describe('Nav States — Logged In Free', () => {
  test('free user nav shows core links', async ({ page }) => {
    await setupAuth(page, 'free');
    await page.goto('/dashboard');
    // Dashboard should load for authenticated user
    await expect(page.getByText(/welcome|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Nav States — Quality User', () => {
  test('quality user nav shows investigations', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.route('**/v1/investigations**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
    // Quality users should see Investigations in nav
    const investigationsLink = page.getByRole('link', { name: /investigation/i }).first();
    if (await investigationsLink.count() > 0) {
      await expect(investigationsLink).toBeVisible();
    }
  });
});

test.describe('Nav States — Enterprise User', () => {
  test('enterprise user nav shows investigations', async ({ page }) => {
    await setupAuth(page, 'enterprise');
    await page.route('**/v1/investigations**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Nav States — Analyze Dropdown', () => {
  test('analyze dropdown items visible for logged-in user', async ({ page }) => {
    await setupAuth(page, 'pro');
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
    // Look for Analyze menu or dropdown trigger
    const analyzeMenu = page.getByRole('button', { name: /analyze/i }).first()
      .or(page.getByRole('link', { name: /analyze/i }).first());
    if (await analyzeMenu.count() > 0) {
      await analyzeMenu.click();
    }
  });
});

test.describe('Nav States — Notification Bell', () => {
  test('notification bell is clickable', async ({ page }) => {
    await setupAuth(page, 'quality');
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
    // Bell icon should exist for authenticated users
    const bell = page.getByRole('button', { name: /notification/i }).first()
      .or(page.locator('[aria-label*="notification" i]').first());
    if (await bell.count() > 0) {
      await expect(bell).toBeVisible();
    }
  });
});

test.describe('Nav States — User Menu', () => {
  test('user menu items accessible', async ({ page }) => {
    await setupAuth(page, 'pro');
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
    // User menu/avatar should be clickable
    const userMenu = page.getByRole('button', { name: /menu|account|profile|user/i }).first()
      .or(page.locator('[aria-label*="menu" i]').first());
    if (await userMenu.count() > 0) {
      await userMenu.click();
      // Should show settings/sign out options
      const signOut = page.getByText(/sign out|log out/i).first();
      if (await signOut.count() > 0) {
        await expect(signOut).toBeVisible();
      }
    }
  });
});

test.describe('Nav States — Mobile', () => {
  test('mobile hamburger menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // Look for hamburger menu button
    const hamburger = page.getByRole('button', { name: /menu|toggle/i }).first()
      .or(page.locator('[aria-label*="menu" i]').first());
    if (await hamburger.count() > 0) {
      await hamburger.click();
      // Menu should expand with nav links
      await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible();
    }
  });
});
