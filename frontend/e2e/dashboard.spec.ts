import { test, expect, type Page } from '@playwright/test';

/**
 * Dashboard E2E tests.
 *
 * Strategy: intercept Supabase auth + backend API calls so the dashboard
 * renders with deterministic data and no real credentials are needed.
 */

const FAKE_USER_ID = '00000000-0000-0000-0000-000000000001';
const FAKE_EMAIL = 'test@gravix.com';
const FAKE_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0ZXN0Iiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiZXhwIjo5OTk5OTk5OTk5fQ.fake';

const FAKE_SESSION = {
  access_token: FAKE_TOKEN,
  refresh_token: 'fake-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: FAKE_USER_ID,
    email: FAKE_EMAIL,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: { email: FAKE_EMAIL },
    created_at: '2025-01-01T00:00:00Z',
  },
};

const FAKE_SPECS = [
  {
    id: 'spec-001',
    substrate_a: 'Polypropylene',
    substrate_b: 'Stainless Steel',
    status: 'complete',
    created_at: '2026-02-10T08:00:00Z',
    material_category: 'Structural Acrylic',
    confidence_score: 0.92,
    recommended_spec: { material_type: 'Structural Acrylic' },
  },
  {
    id: 'spec-002',
    substrate_a: 'HDPE',
    substrate_b: 'Aluminum',
    status: 'complete',
    created_at: '2026-02-08T10:30:00Z',
    material_category: 'Epoxy',
    confidence_score: 0.87,
    recommended_spec: { material_type: 'Two-Part Epoxy' },
  },
];

const FAKE_FAILURES = [
  {
    id: 'fail-001',
    substrate_a: 'ABS',
    substrate_b: 'Glass',
    failure_mode: 'Adhesive failure at interface',
    status: 'complete',
    created_at: '2026-02-11T14:00:00Z',
    material_category: 'Cyanoacrylate',
    confidence_score: 0.85,
  },
];

const FAKE_PROFILE = {
  id: FAKE_USER_ID,
  email: FAKE_EMAIL,
  name: 'Test User',
  plan: 'pro',
  analyses_this_month: 3,
  specs_this_month: 2,
};

const FAKE_USAGE = {
  analyses_used: 3,
  analyses_limit: 50,
  specs_used: 2,
  specs_limit: 50,
  plan: 'pro',
};

const FAKE_PENDING_FEEDBACK: never[] = [];

/** Inject a fake Supabase session into localStorage and intercept auth/API routes. */
async function setupAuthenticatedDashboard(page: Page) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jvyohfodhaeqchjzcopf.supabase.co';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';
  const ref = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || 'jvyohfodhaeqchjzcopf';

  // Intercept Supabase auth endpoints
  await page.route(`${supabaseUrl}/auth/v1/token*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_SESSION) }),
  );
  await page.route(`${supabaseUrl}/auth/v1/user`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_SESSION.user) }),
  );

  // Intercept backend API calls
  await page.route(`${apiUrl}/me`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_PROFILE) }),
  );
  await page.route(`${apiUrl}/me/usage`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USAGE) }),
  );
  await page.route(`${apiUrl}/specify?*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_SPECS) }),
  );
  await page.route(`${apiUrl}/specify`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_SPECS) });
    }
    return route.continue();
  });
  await page.route(`${apiUrl}/analyze?*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_FAILURES) }),
  );
  await page.route(`${apiUrl}/analyze`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_FAILURES) });
    }
    return route.continue();
  });
  await page.route(`${apiUrl}/feedback/pending*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_PENDING_FEEDBACK) }),
  );

  // Inject fake Supabase session into localStorage before navigating
  await page.addInitScript(
    ({ ref, session }) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
    },
    { ref, session: FAKE_SESSION },
  );
}

test.describe('Dashboard — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedDashboard(page);
  });

  test('loads and displays Recent Analyses (no hang)', async ({ page }) => {
    await page.goto('/dashboard');

    // Greeting should appear with the user's email prefix
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 15_000 });

    // Skeleton loaders should disappear and the table should render
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Should show all 3 analyses (2 specs + 1 failure)
    await expect(page.getByText('Polypropylene → Stainless Steel')).toBeVisible();
    await expect(page.getByText('HDPE → Aluminum')).toBeVisible();
    await expect(page.getByText('ABS → Glass')).toBeVisible();
  });

  test('shows correct plan badge and usage', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 15_000 });

    // Plan badge
    await expect(page.getByText('pro')).toBeVisible();

    // Usage text
    await expect(page.getByText('3/50 analyses used')).toBeVisible();
  });

  test('quick actions link to correct pages', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 15_000 });

    const specLink = page.getByRole('link', { name: /new material spec/i });
    await expect(specLink).toBeVisible();
    await expect(specLink).toHaveAttribute('href', '/tool');

    const failureLink = page.getByRole('link', { name: /diagnose a failure/i });
    await expect(failureLink).toBeVisible();
    await expect(failureLink).toHaveAttribute('href', '/failure');
  });

  test('analyses are sorted newest first', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 });

    const rows = page.locator('table tbody tr');
    const dates = await rows.locator('td:last-child').allTextContents();
    // Failure (Feb 11) should come before Spec-1 (Feb 10) which comes before Spec-2 (Feb 8)
    expect(dates[0]).toContain('2026-02-11');
    expect(dates[1]).toContain('2026-02-10');
    expect(dates[2]).toContain('2026-02-08');
  });

  test('clicking an analysis row navigates to detail', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 });

    // Click the first row (failure analysis, newest)
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await page.waitForURL(/\/history\/failure\/fail-001/);
  });

  test('shows empty state when no analyses exist', async ({ page }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

    // Override the routes to return empty arrays
    await page.route(`${apiUrl}/specify`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.route(`${apiUrl}/analyze`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText(/no analyses yet/i)).toBeVisible({ timeout: 10_000 });
  });
});
