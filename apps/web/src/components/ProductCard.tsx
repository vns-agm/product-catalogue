import type { ProductSummary } from '@catalogue/contracts';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from './LazyImage';
import { Price } from './Price';
import { RatingStars } from './RatingStars';

interface ProductCardProps {
  product: ProductSummary;
  badge?: string;
  eager?: boolean;
}

export function ProductCard({ product, badge, eager }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__media">
          {badge && <span className="product-card__badge">{badge}</span>}
          <LazyImage src={product.imageUrl} alt="" eager={eager} />
          <span className="product-card__cta" aria-hidden="true">
            View details →
          </span>
        </div>
        <div className="product-card__body">
          <p className="product-card__category">{product.category.name}</p>
          <h3 className="product-card__title">{product.title}</h3>
          <RatingStars rating={product.rating} />
          <Price price={product.price} className="product-card__price" />
        </div>
      </Link>
    </article>
  );
}

interface ProductGridProps {
  products: ProductSummary[];
  label: string;
  /** Optional badge per position, e.g. ranking in a "top rated" list. */
  badgeFor?: (index: number) => string | undefined;
  /** How many leading images to load eagerly (likely above the fold). */
  eagerCount?: number;
}

export function ProductGrid({ products, label, badgeFor, eagerCount = 4 }: ProductGridProps) {
  return (
    <ul className="product-grid" aria-label={label}>
      {products.map((product, index) => (
        <li key={product.id} style={{ '--i': Math.min(index, 12) } as CSSProperties}>
          <ProductCard product={product} badge={badgeFor?.(index)} eager={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
