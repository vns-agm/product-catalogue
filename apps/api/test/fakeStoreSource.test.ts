import { describe, expect, it, vi } from 'vitest';
import { FakeStoreProductSource, FakeStoreSnapshotSource, toCategory } from '../src/catalogue/fakeStoreSource';
import { UpstreamError } from '../src/http/errors';

const raw = [
  {
    id: 1,
    title: 'Backpack',
    price: 109.95,
    description: 'Fits 15 inch laptops',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/1.png',
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 5,
    title: 'Bracelet',
    price: 695,
    description: 'Silver dragon',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/5.png',
    rating: { rate: 4.6, count: 400 },
  },
];

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

function source(fetchFn: typeof fetch, now = () => 0) {
  return new FakeStoreProductSource({
    baseUrl: 'https://fakestore.test',
    timeoutMs: 1000,
    cacheTtlMs: 60_000,
    fetchFn,
    now,
  });
}

describe('FakeStoreProductSource', () => {
  it('maps upstream products into our own shape', async () => {
    const products = source(vi.fn(async () => ok(raw)));
    expect(await products.getProduct('1')).toEqual({
      id: '1',
      title: 'Backpack',
      description: 'Fits 15 inch laptops',
      price: { amount: 109.95, currency: 'USD' },
      imageUrl: 'https://fakestoreapi.com/img/1.png',
      category: { slug: 'mens-clothing', name: "Men's clothing" },
      rating: { average: 3.9, count: 120 },
    });
  });

  it('answers category, id-list and search queries', async () => {
    const products = source(vi.fn(async () => ok(raw)));
    expect((await products.listCategories()).map((c) => c.slug)).toEqual(['jewelery', 'mens-clothing']);
    expect((await products.listProductsInCategory('jewelery')).map((p) => p.id)).toEqual(['5']);
    expect((await products.getProducts(['5', '404', '1'])).map((p) => p.id)).toEqual(['5', '1']);
    expect((await products.search('LAPTOP')).map((p) => p.id)).toEqual(['1']);
    expect(await products.search('   ')).toEqual([]);
  });

  it('caches the upstream response and shares in-flight requests', async () => {
    const fetchFn = vi.fn(async () => ok(raw));
    let time = 0;
    const products = source(fetchFn, () => time);

    await Promise.all([products.getProduct('1'), products.listCategories()]);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    time = 59_999;
    await products.getProduct('1');
    expect(fetchFn).toHaveBeenCalledTimes(1);

    time = 60_001;
    await products.getProduct('1');
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('does not cache failures', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('nope', { status: 503 }))
      .mockResolvedValueOnce(ok(raw));
    const products = source(fetchFn);

    await expect(products.getProduct('1')).rejects.toBeInstanceOf(UpstreamError);
    expect(await products.getProduct('1')).not.toBeNull();
  });

  it('wraps network errors and unexpected payloads as UpstreamError', async () => {
    await expect(
      source(vi.fn(async () => Promise.reject(new TypeError('fetch failed')))).getProduct('1'),
    ).rejects.toBeInstanceOf(UpstreamError);
    await expect(source(vi.fn(async () => ok([{ id: 'x' }]))).getProduct('1')).rejects.toThrow(
      'unexpected payload',
    );
    await expect(
      source(vi.fn(async () => new Response('<html>', { status: 200 }))).getProduct('1'),
    ).rejects.toBeInstanceOf(UpstreamError);
  });
});

describe('FakeStoreSnapshotSource', () => {
  it('serves the committed snapshot through the same mapping', async () => {
    const products = new FakeStoreSnapshotSource();
    expect((await products.listCategories()).map((c) => c.slug)).toEqual([
      'electronics',
      'jewelery',
      'mens-clothing',
      'womens-clothing',
    ]);
    expect(await products.getProduct('1')).toMatchObject({ id: '1', price: { currency: 'USD' } });
  });

  it('rejects a malformed snapshot', async () => {
    await expect(new FakeStoreSnapshotSource([{ id: 'x' }]).getProduct('1')).rejects.toBeInstanceOf(
      UpstreamError,
    );
  });
});

describe('toCategory', () => {
  it.each([
    ["men's clothing", 'mens-clothing', "Men's clothing"],
    ['electronics', 'electronics', 'Electronics'],
    ['Home & Garden', 'home-garden', 'Home & Garden'],
  ])('%s -> %s', (input, slug, name) => {
    expect(toCategory(input)).toEqual({ slug, name });
  });
});
