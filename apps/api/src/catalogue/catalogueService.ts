import type { CategorySummary, Product, ProductSummary } from '@catalogue/contracts';
import { NotFoundError } from '../http/errors';
import type { ProductSource } from './productSource';

interface CatalogueOptions {
  featuredProductIds: string[];
  categoryTopRatedCount: number;
  logger?: Pick<Console, 'warn'>;
}

const PREVIEW_IMAGES = 3;

/** Merchandising rules (what is "featured", what is "top rated") live here, not in the source. */
export class CatalogueService {
  private readonly logger: Pick<Console, 'warn'>;

  constructor(
    private readonly source: ProductSource,
    private readonly options: CatalogueOptions,
  ) {
    this.logger = options.logger ?? console;
  }

  async getFeatured(): Promise<ProductSummary[]> {
    const ids = this.options.featuredProductIds;
    const products = await this.source.getProducts(ids);
    if (products.length !== ids.length) {
      const found = new Set(products.map((product) => product.id));
      this.logger.warn(
        `Featured product ids not found in source: ${ids.filter((id) => !found.has(id)).join(', ')}`,
      );
    }
    return products.map(toSummary);
  }

  /** Categories with a product count and preview images of their best-rated products. */
  async listCategories(): Promise<CategorySummary[]> {
    const categories = await this.source.listCategories();
    return Promise.all(
      categories.map(async (category) => {
        const products = [...(await this.source.listProductsInCategory(category.slug))].sort(byRating);
        return {
          ...category,
          productCount: products.length,
          previewImageUrls: products.slice(0, PREVIEW_IMAGES).map((product) => product.imageUrl),
        };
      }),
    );
  }

  async getCategoryPage(slug: string) {
    const category = (await this.source.listCategories()).find((c) => c.slug === slug);
    if (!category) throw new NotFoundError(`Category "${slug}" does not exist`);

    const products = await this.source.listProductsInCategory(slug);
    const ranked = [...products].sort(byRating).map(toSummary);
    const cut = this.options.categoryTopRatedCount;
    return { category, topRated: ranked.slice(0, cut), more: ranked.slice(cut) };
  }

  async search(query: string): Promise<ProductSummary[]> {
    return (await this.source.search(query)).map(toSummary);
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.source.getProduct(id);
    if (!product) throw new NotFoundError(`Product "${id}" does not exist`);
    return product;
  }
}

/** Highest average first; more reviews breaks ties so a single 5★ review doesn't win. */
export function byRating(a: Product, b: Product): number {
  return b.rating.average - a.rating.average || b.rating.count - a.rating.count;
}

export function toSummary({ description: _description, ...summary }: Product): ProductSummary {
  return summary;
}
