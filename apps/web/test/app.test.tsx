import type { Product, ProductSummary } from '@catalogue/contracts';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiRequestError } from '../src/api/client';
import { routes } from '../src/App';

const electronics = { slug: 'electronics', name: 'Electronics' };

function summary(id: string, title: string): ProductSummary {
  return {
    id,
    title,
    price: { amount: 10, currency: 'USD' },
    imageUrl: `https://img.test/${id}.png`,
    category: electronics,
    rating: { average: 4, count: 10 },
    excerpt: `About ${title}`,
  };
}

const { excerpt: _excerpt, ...driveSummary } = summary('2', 'Gaming drive');
const drive: Product = { ...driveSummary, description: 'Fast storage for consoles' };

/** Renders the real route tree at `path`, with the API client stubbed. */
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  vi.spyOn(api, 'categories').mockResolvedValue({
    categories: [{ ...electronics, productCount: 6, previewImageUrls: ['https://img.test/a.png', 'https://img.test/b.png'] }],
  });
});

describe('home page', () => {
  it('shows the featured products', async () => {
    const featured = ['A', 'B', 'C', 'D', 'E'].map((t, i) => summary(String(i + 1), `Product ${t}`));
    vi.spyOn(api, 'featured').mockResolvedValue({ products: featured });

    renderAt('/');

    const grid = await screen.findByRole('list', { name: 'Top rated products' });
    expect(within(grid).getAllByRole('listitem')).toHaveLength(5);
    expect(within(grid).getByText('Product A')).toBeInTheDocument();
  });

  it('shows each category as a card with its product count and preview images', async () => {
    vi.spyOn(api, 'featured').mockResolvedValue({ products: [] });
    const router = renderAt('/');

    const grid = await screen.findByRole('list', { name: 'Shop by category' });
    const card = within(grid).getByRole('link', { name: 'Electronics, 6 products' });
    expect(card.querySelectorAll('img')).toHaveLength(2);

    await userEvent.click(card);
    expect(router.state.location.pathname).toBe('/categories/electronics');
  });

  it('shows an error with a retry when the API fails', async () => {
    const featured = vi
      .spyOn(api, 'featured')
      .mockRejectedValueOnce(new ApiRequestError(502, 'upstream_unavailable', 'Products are temporarily unavailable.'))
      .mockResolvedValueOnce({ products: [summary('1', 'Recovered')] });

    renderAt('/');

    expect(await screen.findByRole('alert')).toHaveTextContent('temporarily unavailable');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    const grid = await screen.findByRole('list', { name: 'Top rated products' });
    expect(within(grid).getByText('Recovered')).toBeInTheDocument();
    expect(featured).toHaveBeenCalledTimes(2);
  });
});

describe('category page', () => {
  it('links to each category and shows its top rated and additional products', async () => {
    vi.spyOn(api, 'featured').mockResolvedValue({ products: [] });
    const category = vi.spyOn(api, 'category').mockResolvedValue({
      category: electronics,
      topRated: [summary('2', 'Gaming drive')],
      more: [summary('4', 'Monitor')],
    });

    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Categories' });
    await userEvent.click(await within(nav).findByRole('link', { name: 'Electronics' }));

    // Pages are code-split, so the request happens once the page chunk has loaded.
    const topRated = await screen.findByRole('list', { name: 'Top rated in Electronics' });
    expect(category).toHaveBeenCalledWith('electronics');
    expect(within(topRated).getByText('Gaming drive')).toBeInTheDocument();
    const more = screen.getByRole('list', { name: 'More in Electronics' });
    expect(within(more).getByText('Monitor')).toBeInTheDocument();
  });
});

describe('search', () => {
  it('searches only when the search button is clicked, and shows the results', async () => {
    vi.spyOn(api, 'featured').mockResolvedValue({ products: [] });
    const search = vi
      .spyOn(api, 'search')
      .mockResolvedValue({ query: 'drive', products: [summary('2', 'Gaming drive')] });

    const router = renderAt('/');
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search products' }), '  drive ');
    expect(search).not.toHaveBeenCalled();
    await userEvent.click(button);

    expect(router.state.location.search).toBe('?q=drive');
    const results = await screen.findByRole('list', { name: 'Search results' });
    expect(search).toHaveBeenCalledWith('drive');
    expect(within(results).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: /1 result for “drive”/ })).toBeInTheDocument();
  });

  it('tells the user when nothing matches', async () => {
    vi.spyOn(api, 'search').mockResolvedValue({ query: 'zzz', products: [] });
    renderAt('/search?q=zzz');
    expect(await screen.findByText(/No products match/)).toBeInTheDocument();
  });
});

describe('category sorting', () => {
  it('re-orders the additional products and keeps the choice in the URL', async () => {
    const cheap = { ...summary('6', 'Cheap cable'), price: { amount: 5, currency: 'USD' } };
    const pricey = { ...summary('7', 'Pricey monitor'), price: { amount: 500, currency: 'USD' } };
    vi.spyOn(api, 'category').mockResolvedValue({ category: electronics, topRated: [], more: [cheap, pricey] });

    const router = renderAt('/categories/electronics');
    const more = await screen.findByRole('list', { name: 'More in Electronics' });
    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'price-desc');

    const titles = within(more).getAllByRole('heading').map((h) => h.textContent);
    expect(titles).toEqual(['Pricey monitor', 'Cheap cable']);
    expect(router.state.location.search).toBe('?sort=price-desc');
  });
});

describe('product page and enquiry', () => {
  beforeEach(() => {
    vi.spyOn(api, 'featured').mockResolvedValue({ products: [summary('2', 'Gaming drive')] });
    vi.spyOn(api, 'product').mockResolvedValue({ product: drive });
  });

  it('opens product details when a product tile is clicked', async () => {
    renderAt('/');
    const grid = await screen.findByRole('list', { name: 'Top rated products' });
    await userEvent.click(within(grid).getByRole('link', { name: /Gaming drive/ }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Gaming drive' })).toBeInTheDocument();
    expect(screen.getByText('Fast storage for consoles')).toBeInTheDocument();
    expect(api.product).toHaveBeenCalledWith('2');
  });

  it('submits an enquiry and thanks the customer', async () => {
    const submit = vi.spyOn(api, 'submitEnquiry').mockResolvedValue({ enquiryId: 'e-1' });
    renderAt('/products/2');

    await userEvent.click(await screen.findByRole('button', { name: 'Enquire' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/Message/), 'In stock?');
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(submit).toHaveBeenCalledWith({
      productId: '2',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '',
      message: 'In stock?',
      company: '',
    });
    expect(await screen.findByRole('heading', { name: 'Thank you' })).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Enquiry form' })).not.toBeInTheDocument();
  });

  it('validates required fields before calling the API', async () => {
    const submit = vi.spyOn(api, 'submitEnquiry');
    renderAt('/products/2');

    await userEvent.click(await screen.findByRole('button', { name: 'Enquire' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(submit).not.toHaveBeenCalled();
  });

  it('shows field errors returned by the API and lets the user retry', async () => {
    vi.spyOn(api, 'submitEnquiry').mockRejectedValue(
      new ApiRequestError(400, 'validation_failed', 'Request is invalid', { phone: 'Please enter a valid phone number' }),
    );
    renderAt('/products/2');

    await userEvent.click(await screen.findByRole('button', { name: 'Enquire' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/Phone/), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByText('Please enter a valid phone number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
  });
});
