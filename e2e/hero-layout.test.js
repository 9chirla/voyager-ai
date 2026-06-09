import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1920, height: 1080 },
];

for (const viewport of VIEWPORTS) {
  test(`hero copy is fully in view on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('Your next trip');
    await expect(heading).toBeVisible();

    const subhead = page.getByText(/Tell us where you're going/);
    await expect(subhead).toBeVisible();

    const cta = page.locator('.hero-cta-btn');
    await expect(cta).toBeVisible();

    const vp = page.viewportSize();
    const headingBox = await heading.boundingBox();
    const subheadBox = await subhead.boundingBox();
    const ctaBox = await cta.boundingBox();

    expect(headingBox).not.toBeNull();
    expect(subheadBox).not.toBeNull();
    expect(ctaBox).not.toBeNull();

    expect(headingBox.y).toBeGreaterThanOrEqual(0);
    expect(headingBox.y + headingBox.height).toBeLessThanOrEqual(vp.height + 2);

    expect(subheadBox.y).toBeGreaterThanOrEqual(0);
    expect(subheadBox.y + subheadBox.height).toBeLessThanOrEqual(vp.height + 2);

    expect(ctaBox.y).toBeGreaterThanOrEqual(0);
    expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(vp.height + 2);
  });
}
