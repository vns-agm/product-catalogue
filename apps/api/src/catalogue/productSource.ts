import type { Category, Product } from '@catalogue/contracts';

/**
 * The boundary between the catalogue and wherever product data lives.
 *
 * Fake Store is the only implementation today. A future source (a PIM, a
 * database, a search index) implements this interface and is swapped in
 * `container.ts`; nothing in the HTTP layer or the client changes.
 *
 * Methods are deliberately query-shaped rather than "give me everything" so a
 * real source can push filtering and search down to where the data lives.
 */
export interface ProductSource {
  listCategories(): Promise<Category[]>;
  listProductsInCategory(categorySlug: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  /** Returns the products that exist, in the order requested. Unknown ids are skipped. */
  getProducts(ids: string[]): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
}

/**
 * Case-insensitive match where every whitespace-separated term must appear in
 * the product's title, description or category name.
 */
export function matchesSearch(product: Product, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return false;
  const haystack = [product.title, product.description, product.category.name]
    .join(' ')
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}
