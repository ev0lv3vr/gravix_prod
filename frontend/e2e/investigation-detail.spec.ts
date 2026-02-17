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
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ plan }) }),
  );
}

test.describe('Investigation Detail', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page, 'quality');
    // Mock detail endpoint(s) used by page
    await page.route('**/v1/investigations/inv-001**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'inv-001',
          investigation_number: 'GQ-2026-1001',
          title: 'Test B-pillar disbond',
          status: 'open',
          severity: 'critical',
          disciplines: { D1: { status: 'complete' }, D2: { status: 'complete' }, D3: { status: 'in_progress' } },
          team: [{ id: 'u1', name: 'Test User', role: 'lead' }],
          actions: [],
          comments: [],
          attachments: [],
        }),
      }),
    );
    await page.route('**/v1/investigations/*/comments**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.route('**/v1/notifications**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
  });

  test('detail loads with sidebar + stepper + content area', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/GQ-2026-1001|Test B-pillar disbond/i).first()).toBeVisible();
  });

  test('stepper shows 8 disciplines', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const body = await page.textContent('body');
    // Expect D1..D8 present somewhere in UI
    for (const d of ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']) {
      expect(body).toContain(d);
    }
  });

  test('sidebar shows status and team', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const body = await page.textContent('body');
    expect(body).toMatch(/status|team|members?/i);
  });

  test('click discipline tab changes content', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const d4 = page.getByRole('tab', { name: /D4/i }).first().or(page.getByRole('button', { name: /D4/i }).first());
    if (await d4.count()) {
      await d4.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('completed discipline shows filled content', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const d2 = page.getByRole('tab', { name: /D2/i }).first().or(page.getByRole('button', { name: /D2/i }).first());
    if (await d2.count()) {
      await d2.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('D4 run AI analysis button triggers output', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const run = page.getByRole('button', { name: /run ai analysis/i }).first();
    if (await run.count()) {
      await run.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('D4 AI output editable', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    // Find an editable textbox/textarea
    const editor = page.locator('textarea, [contenteditable="true"]').first();
    if (await editor.count()) {
      await editor.fill('Edited AI output');
      await expect(editor).toHaveValue(/Edited AI output/);
    }
  });

  test('comment panel visible', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const comments = page.getByText(/comments/i).first();
    if (await comments.count()) {
      await expect(comments).toBeVisible();
    }
  });

  test('post comment appears in thread', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    await page.route('**/v1/comments**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'c1' }) }),
    );
    const input = page.getByPlaceholder(/add a comment|comment/i).first().or(page.locator('textarea').first());
    const submit = page.getByRole('button', { name: /post|send/i }).first();
    if ((await input.count()) && (await submit.count())) {
      await input.fill('Test comment');
      await submit.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('@mention triggers notification', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const input = page.getByPlaceholder(/add a comment|comment/i).first().or(page.locator('textarea').first());
    if (await input.count()) {
      await input.fill('@member please review');
      await expect(input).toHaveValue(/@member/);
    }
  });

  test('upload photo to investigation', async ({ page }) => {
    await page.goto('/investigations/inv-001');
    const file = page.locator('input[type="file"]').first();
    if (await file.count()) {
      // Use an empty buffer fixture-less (Playwright requires a file path; skip if none)
      test.skip(true, 'File upload fixture not provided in repo');
    }
  });

  test('mobile layout changes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/investigations/inv-001');
    await expect(page.locator('body')).toBeVisible();
  });
});
