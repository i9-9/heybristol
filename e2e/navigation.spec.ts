import { test, expect } from '@playwright/test';

test.describe('Bristol navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('homepage renders hero and directors section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'DIRECTORS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CONTACT' })).toBeVisible();
  });

  test('hero exposes section navigation controls', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Ir a directores' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ir a contacto' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Activar música|Silenciar música/ })).toBeVisible();
  });

  test('director routes are reachable from the directors list', async ({ page }) => {
    await page.goto('/');

    const directorLinks = page.locator('#directors a[href^="/directors/"]');
    await expect(directorLinks.first()).toHaveAttribute('href', /\/directors\/[^/]+\/$/);

    const href = await directorLinks.first().getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    await expect(page.getByRole('button', { name: 'Volver a directores' })).toBeVisible();
  });

  test('404 page links back home', async ({ page }) => {
    await page.goto('/this-page-does-not-exist/');

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('#hero')).toBeVisible();
  });
});
