import { expect, test } from '@playwright/test';

/**
 * End-to-end coverage of the acceptance criteria in
 * specs/001-product-catalogue/spec.md, against the real API and web app.
 * Product data comes from the committed snapshot (see playwright.config.ts),
 * so names, order and prices below are stable.
 */

const FEATURED = [
  'Mens Cotton Jacket',
  "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
  'WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive',
  "MBJ Women's Solid Short Sleeve Boat Neck V",
  "Opna Women's Short Sleeve Moisture",
];

test.describe('US1: home page', () => {
  test('shows the five chosen featured products, ranked, in the chosen order', async ({ page }) => {
    await page.goto('/');

    const featured = page.getByRole('list', { name: 'Top rated products' });
    const cards = featured.getByRole('listitem');
    await expect(cards).toHaveCount(5);
    await expect(featured.getByRole('heading', { level: 3 })).toHaveText(FEATURED);
    await expect(cards.first()).toContainText('No. 1');
    await expect(cards.last()).toContainText('No. 5');
  });

  test('hero call to action scrolls to the top-rated products', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Considered pieces');

    await page.getByRole('link', { name: 'Explore the collection' }).click();
    await expect(page.getByRole('heading', { name: 'The most loved pieces' })).toBeInViewport();
  });

  test('lists every category as a card with its product count', async ({ page }) => {
    await page.goto('/');
    const categories = page.getByRole('list', { name: 'Shop by category' });
    await expect(categories.getByRole('link')).toHaveText([
      /Electronics/,
      /Jewelery/,
      /Men's clothing/,
      /Women's clothing/,
    ]);
    await expect(categories.getByRole('link', { name: 'Electronics, 6 products' })).toBeVisible();
  });
});

test.describe('US2: category page', () => {
  test('category link shows top-rated products, then the rest', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Categories' }).getByRole('link', { name: 'Electronics' }).click();

    await expect(page).toHaveURL(/\/categories\/electronics$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Electronics' })).toBeVisible();

    const topRated = page.getByRole('list', { name: 'Top rated in Electronics' });
    await expect(topRated.getByRole('listitem')).toHaveCount(3);
    await expect(topRated.getByRole('heading', { level: 3 }).first()).toHaveText(/WD 4TB Gaming Drive/);

    const more = page.getByRole('list', { name: 'More in Electronics' });
    await expect(more.getByRole('listitem')).toHaveCount(3);
  });

  test('sorting the additional products re-orders them and survives a reload', async ({ page }) => {
    await page.goto('/categories/electronics');
    const moreTitles = page.getByRole('list', { name: 'More in Electronics' }).getByRole('heading', { level: 3 });

    // Default: best rated first.
    await expect(moreTitles).toHaveText([/SanDisk/, /Acer/, /Samsung/]);

    await page.getByLabel('Sort by').selectOption('price-desc');
    await expect(page).toHaveURL(/sort=price-desc/);
    await expect(moreTitles).toHaveText([/Samsung/, /Acer/, /SanDisk/]);

    await page.reload();
    await expect(page.getByLabel('Sort by')).toHaveValue('price-desc');
    await expect(moreTitles).toHaveText([/Samsung/, /Acer/, /SanDisk/]);
  });

  test('an unknown category shows a not-found message', async ({ page }) => {
    await page.goto('/categories/does-not-exist');
    await expect(page.getByRole('alert')).toContainText('Not found');
  });
});

test.describe('US3: search', () => {
  test('search button is disabled until a term is entered', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Search', exact: true });
    await expect(button).toBeDisabled();
    await page.getByRole('searchbox', { name: 'Search products' }).fill('   ');
    await expect(button).toBeDisabled();
  });

  test('clicking search shows only products matching the term', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Search products' }).fill('jacket');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page).toHaveURL(/\/search\?q=jacket$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('4 results for “jacket”');

    const titles = page.getByRole('list', { name: 'Search results' }).getByRole('heading', { level: 3 });
    await expect(titles).toHaveCount(4);
    for (const title of await titles.allTextContents()) {
      expect(title.toLowerCase()).toContain('jacket');
    }
  });

  test('a search with no matches says so', async ({ page }) => {
    await page.goto('/search?q=zzzznothing');
    await expect(page.getByRole('heading', { name: 'No matches' })).toBeVisible();
    await expect(page.getByText('No products match that search')).toBeVisible();
  });

  test('pressing "/" focuses the search box', async ({ page }) => {
    await page.goto('/');
    await page.locator('body').press('/');
    await expect(page.getByRole('searchbox', { name: 'Search products' })).toBeFocused();
  });
});

test.describe('US4: product details', () => {
  test('clicking a product tile opens its details page', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('list', { name: 'Top rated products' })
      .getByRole('link', { name: /Mens Cotton Jacket/ })
      .click();

    await expect(page).toHaveURL(/\/products\/3$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mens Cotton Jacket');
    await expect(page.getByText('$55.99')).toBeVisible();
    await expect(page.getByText(/great outerwear jackets/i)).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText("Men's clothing");
  });

  test('an unknown product shows a not-found message', async ({ page }) => {
    await page.goto('/products/999');
    await expect(page.getByRole('alert')).toContainText('Not found');
  });
});

test.describe('US5: enquiry', () => {
  test('a completed enquiry reaches the API and the customer is thanked', async ({ page }) => {
    await page.goto('/products/5');
    await page.getByRole('button', { name: 'Enquire' }).click();

    await page.getByLabel('Name').fill('E2E Test Customer');
    await page.getByLabel('Email').fill('e2e-test@example.com');
    await page.getByLabel(/Message/).fill('Automated end-to-end test, please ignore.');

    const response = page.waitForResponse(
      (res) => res.url().endsWith('/api/enquiries') && res.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Send enquiry' }).click();

    expect((await response).status()).toBe(201);
    await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('e2e-test@example.com');
  });

  test('missing details are flagged and nothing is sent', async ({ page }) => {
    await page.goto('/products/5');
    await page.getByRole('button', { name: 'Enquire' }).click();

    let posted = false;
    page.on('request', (req) => {
      if (req.url().endsWith('/api/enquiries') && req.method() === 'POST') posted = true;
    });
    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.getByText('Please enter your name')).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(posted).toBe(false);
  });
});

test.describe('architecture and resilience', () => {
  test('the browser never calls the product data source directly', async ({ page }) => {
    const directCalls: string[] = [];
    page.on('request', (req) => {
      // Product images are static assets; product *data* must come through our API.
      if (/fakestoreapi\.com\/products/.test(req.url())) directCalls.push(req.url());
    });

    await page.goto('/');
    await expect(page.getByRole('list', { name: 'Top rated products' })).toBeVisible();
    await page.goto('/categories/jewelery');
    await page.goto('/products/5');
    await page.goto('/search?q=gold');
    await expect(page.getByRole('list', { name: 'Search results' })).toBeVisible();

    expect(directCalls).toEqual([]);
  });

  test('an unknown page shows a friendly not-found page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to the catalogue' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('dark mode switches to the dark palette', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe('rgb(20, 19, 17)');
  });
});
