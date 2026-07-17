import { expect, test } from '@playwright/test';

test('starts app in portrait mobile viewport without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.locator('.orientation-overlay')).toBeHidden();
  await expect(page.locator('.status')).toContainText('Нарисуйте траекторию');
  await expect.poll(() => errors).toEqual([]);
});

test('shows rotate overlay in landscape and hides it in portrait', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expect(page.locator('.orientation-overlay')).toBeVisible();
  await expect(page.locator('.orientation-overlay')).toContainText('Поверните устройство');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.orientation-overlay')).toBeHidden();
});

test('blocks system scroll on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 100));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
