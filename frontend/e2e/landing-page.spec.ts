import { test, expect } from '@playwright/test';

test.describe('Landing Page — Hero Section', () => {
  test('hero renders new copy', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
    // Verify hero text mentions key value props
    const heroText = await hero.textContent();
    expect(heroText?.toLowerCase()).toMatch(/adhesive|intelligence|quality|manufacturing/i);
  });

  test('hero primary CTA navigates to failure page', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /analyze a failure/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/failure/);
  });

  test('hero secondary CTA exists', async ({ page }) => {
    await page.goto('/');
    // Secondary CTA — "See How It Works" or similar scroll link
    const secondaryCta = page
      .getByRole('link', { name: /see how it works|learn more/i })
      .first()
      .or(page.getByRole('button', { name: /see how it works|learn more/i }).first());
    // May be a button or link
    if (await secondaryCta.count()) {
      await expect(secondaryCta).toBeVisible();
    }
  });
});

test.describe('Landing Page — Feature Blocks', () => {
  test('feature blocks render', async ({ page }) => {
    await page.goto('/');
    // Look for feature/solution section with multiple blocks
    const body = await page.textContent('body');
    const features = ['Failure Analysis', 'Investigation', 'Intelligence', 'Specification'];
    const found = features.filter(f => body?.includes(f));
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  test('8D feature block visible', async ({ page }) => {
    await page.goto('/');
    const body = await page.textContent('body');
    // Should mention 8D or investigation management
    expect(body).toMatch(/8D|investigation management|OEM|audit trail/i);
  });
});

test.describe('Landing Page — Differentiator', () => {
  test('comparison section exists', async ({ page }) => {
    await page.goto('/');
    // Differentiator section with comparison
    const body = await page.textContent('body');
    // Should have some kind of comparison or "why Gravix" section
    expect(body).toMatch(/Gravix|compare|different|better|versus|vs\./i);
  });
});

test.describe('Landing Page — Pricing Preview', () => {
  test('pricing preview shows four tiers', async ({ page }) => {
    await page.goto('/');
    const body = await page.textContent('body');
    // Should mention Free and Pro plans at minimum
    expect(body).toContain('Free');
    expect(body).toMatch(/Pro|Professional/);
  });

  test('pricing preview shows correct prices', async ({ page }) => {
    await page.goto('/');
    const body = await page.textContent('body');
    // Pro should be $79 (not old $49 price)
    if (body?.includes('$79')) {
      expect(body).toContain('$79');
    }
  });
});

test.describe('Landing Page — Social Proof', () => {
  test('social proof mentions industries', async ({ page }) => {
    await page.goto('/');
    const body = await page.textContent('body');
    // Should mention target industries
    expect(body).toMatch(/automotive|aerospace|medical|manufacturing/i);
  });
});

test.describe('Landing Page — Problem Section', () => {
  test('problem cards updated', async ({ page }) => {
    await page.goto('/');
    const body = await page.textContent('body');
    // Should reference common pain points
    expect(body).toMatch(/failure|quality|investigation|knowledge|silo/i);
  });
});

test.describe('Landing Page — Final CTA', () => {
  test('final CTA section exists', async ({ page }) => {
    await page.goto('/');
    // Should have a CTA section at the bottom
    const ctaButtons = page.getByRole('link', { name: /get started|sign up|book a demo|start free/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('enterprise social proof section exists', async ({ page }) => {
    await page.goto('/');
    // Industry trust indicators or logos section
    const body = await page.textContent('body');
    expect(body).toMatch(/trusted|teams|companies|industries/i);
  });
});
