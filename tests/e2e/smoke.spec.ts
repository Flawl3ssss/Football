import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

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
  await expect(page.locator('.screen-panel')).toBeVisible();
  await expect(page.locator('.screen-title')).toContainText('Первый пас');
  await expect.poll(() => errors).toEqual([]);
});

test('plays the first vertical slice to victory', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Начать' }).click();
  await page.mouse.move(195, 610);
  await page.mouse.down();
  await page.mouse.move(195, 520);
  await page.mouse.up();
  await expect(page.locator('.status')).toContainText('Отлично');
  await page.mouse.move(195, 610);
  await page.mouse.down();
  await page.mouse.move(195, 520);
  await page.mouse.up();
  await expect(page.locator('.status')).toContainText('Пас прошёл');
  await expect(page.locator('.status')).toContainText('Проведи к воротам', { timeout: 1500 });
  await page.mouse.move(195, 610);
  await page.mouse.down();
  await page.mouse.move(195, 300);
  await page.mouse.up();
  await expect(page.locator('.screen-panel[data-screen="victory"]')).toBeVisible({ timeout: 1500 });
  await expect(page.locator('.screen-title')).toContainText('Гол');
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
