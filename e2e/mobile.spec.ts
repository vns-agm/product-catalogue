import { expect, test } from '@playwright/test';

/** Runs in the "mobile" project (Pixel 7 viewport and touch). */

test('the menu opens, navigates to a category and closes', async ({ page }) => {
  await page.goto('/');

  // Desktop category links are hidden on phones; the menu replaces them.
  await expect(page.getByRole('navigation', { name: 'Categories' })).toBeHidden();
  await page.getByRole('button', { name: 'Open menu' }).click();

  const menu = page.getByRole('navigation', { name: 'Menu' });
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Jewelery' }).click();

  await expect(page).toHaveURL(/\/categories\/jewelery$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Jewelery' })).toBeVisible();
  await expect(menu).toBeHidden();
});

test('search works from the phone layout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('gold');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Search results' }).getByRole('listitem').first()).toBeVisible();
});

for (const path of ['/', '/categories/electronics', '/products/5', '/search?q=jacket']) {
  test(`no horizontal scrolling on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('main')).toBeVisible();
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
