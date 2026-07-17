import { expect, test } from '@playwright/test';

test('renders mobile shell in portrait viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.game-canvas')).toBeVisible();
  await expect(page.locator('.thumb-zone')).toContainText('Проведите пальцем');
  await expect(page.locator('.rotate-overlay')).not.toBeVisible();
});

test('shows rotate overlay in landscape viewport', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expect(page.locator('.rotate-overlay')).toBeVisible();
});
