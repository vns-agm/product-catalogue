/**
 * HTTP contract between the web client and the API.
 *
 * These are *our* shapes, not the upstream data source's. The API maps whatever
 * source it uses (Fake Store today) into these types, so the client never
 * changes when the source does. Type-only: import with `import type`.
 */

export interface Money {
  /** Decimal amount in major units, e.g. 109.95 */
  amount: number;
  /** ISO 4217 code */
  currency: string;
}

export interface Rating {
  /** 0–5 */
  average: number;
  count: number;
}

export interface Category {
  /** URL-safe identifier, e.g. "mens-clothing" */
  slug: string;
  /** Display name, e.g. "Men's clothing" */
  name: string;
}

/** A category plus what's needed to render it as a browsable card. */
export interface CategorySummary extends Category {
  productCount: number;
  /** Images of the category's best-rated products, best first (up to 3). */
  previewImageUrls: string[];
}

export interface ProductSummary {
  id: string;
  title: string;
  price: Money;
  imageUrl: string;
  category: Category;
  rating: Rating;
  /** A short, sentence-cased teaser of the description for cards (≤ 120 chars). */
  excerpt: string;
}

export interface Product extends Omit<ProductSummary, 'excerpt'> {
  description: string;
}

export interface FeaturedResponse {
  products: ProductSummary[];
}

export interface CategoriesResponse {
  categories: CategorySummary[];
}

export interface CategoryPageResponse {
  category: Category;
  topRated: ProductSummary[];
  more: ProductSummary[];
}

export interface SearchResponse {
  query: string;
  products: ProductSummary[];
}

export interface ProductResponse {
  product: Product;
}

export interface EnquiryRequest {
  productId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  /** Honeypot. Real users leave this empty; it is hidden in the UI. */
  company?: string;
}

export interface EnquiryResponse {
  enquiryId: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    /** Field-level validation messages, keyed by field name */
    fields?: Record<string, string>;
  };
}
