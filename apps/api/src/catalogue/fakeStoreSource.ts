import type { Category, Product } from '@catalogue/contracts';
import { z } from 'zod';
import { UpstreamError } from '../http/errors';
import snapshot from './fakestore-snapshot.json';
import { matchesSearch, type ProductSource } from './productSource';

/** Shape returned by https://fakestoreapi.com/products. Validated, never trusted. */
const fakeStoreProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
  rating: z.object({ rate: z.number(), count: z.number() }).optional(),
});
type FakeStoreProduct = z.infer<typeof fakeStoreProductSchema>;

export function toCategory(raw: string): Category {
  const slug = raw
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);
  return { slug, name };
}

export function toProduct(raw: FakeStoreProduct): Product {
  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description,
    // Fake Store has no currency; it is a US store, so assume USD.
    price: { amount: raw.price, currency: 'USD' },
    imageUrl: raw.image,
    category: toCategory(raw.category),
    rating: { average: raw.rating?.rate ?? 0, count: raw.rating?.count ?? 0 },
  };
}

function parseFakeStoreProducts(payload: unknown): Product[] {
  const parsed = z.array(fakeStoreProductSchema).safeParse(payload);
  if (!parsed.success) {
    throw new UpstreamError('Product source returned an unexpected payload', { cause: parsed.error });
  }
  return parsed.data.map(toProduct);
}

/**
 * Answers every query in memory from a full product list, cached for `cacheTtlMs`.
 * Right for Fake Store (~20 products, no search endpoint); a large catalogue
 * would implement ProductSource against an indexed store instead.
 */
class ListBackedProductSource implements ProductSource {
  private cache: { expiresAt: number; products: Promise<Product[]> } | null = null;

  constructor(
    private readonly load: () => Promise<Product[]>,
    private readonly cacheTtlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  async listCategories(): Promise<Category[]> {
    const products = await this.all();
    const bySlug = new Map<string, Category>();
    for (const product of products) bySlug.set(product.category.slug, product.category);
    return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async listProductsInCategory(categorySlug: string): Promise<Product[]> {
    return (await this.all()).filter((product) => product.category.slug === categorySlug);
  }

  async getProduct(id: string): Promise<Product | null> {
    return (await this.all()).find((product) => product.id === id) ?? null;
  }

  async getProducts(ids: string[]): Promise<Product[]> {
    const byId = new Map((await this.all()).map((product) => [product.id, product]));
    return ids.flatMap((id) => byId.get(id) ?? []);
  }

  async search(query: string): Promise<Product[]> {
    return (await this.all()).filter((product) => matchesSearch(product, query));
  }

  private all(): Promise<Product[]> {
    if (this.cache && this.cache.expiresAt > this.now()) return this.cache.products;

    // Cache the promise, not the result, so concurrent requests share one load.
    const products = this.load();
    this.cache = { expiresAt: this.now() + this.cacheTtlMs, products };
    products.catch(() => {
      // Never cache a failure.
      if (this.cache?.products === products) this.cache = null;
    });
    return products;
  }
}

interface FakeStoreOptions {
  baseUrl: string;
  timeoutMs: number;
  cacheTtlMs: number;
  fetchFn?: typeof fetch;
  now?: () => number;
}

/** Live data from the Fake Store API. */
export class FakeStoreProductSource extends ListBackedProductSource {
  constructor(options: FakeStoreOptions) {
    const fetchFn = options.fetchFn ?? fetch;
    super(() => fetchFakeStoreProducts(fetchFn, options), options.cacheTtlMs, options.now);
  }
}

/**
 * The same Fake Store data, from a snapshot committed to the repo.
 *
 * Exists because fakestoreapi.com answers HTTP 403 to requests from cloud
 * provider IPs (observed from Vercel), so the hosted demo can't use the live
 * API. Locally the live API is the default. Refresh with `npm run snapshot -w @catalogue/api`.
 */
export class FakeStoreSnapshotSource extends ListBackedProductSource {
  constructor(payload: unknown = snapshot) {
    super(async () => parseFakeStoreProducts(payload), Number.POSITIVE_INFINITY);
  }
}

async function fetchFakeStoreProducts(
  fetchFn: typeof fetch,
  { baseUrl, timeoutMs }: Pick<FakeStoreOptions, 'baseUrl' | 'timeoutMs'>,
): Promise<Product[]> {
  const url = new URL('/products', baseUrl);
  let response: Response;
  try {
    response = await fetchFn(url, {
      headers: { accept: 'application/json', 'user-agent': 'product-catalogue-poc/1.0' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw new UpstreamError('Product source is unreachable', { cause });
  }
  if (!response.ok) {
    throw new UpstreamError(`Product source responded with HTTP ${response.status}`);
  }
  return parseFakeStoreProducts(await response.json().catch(() => null));
}
