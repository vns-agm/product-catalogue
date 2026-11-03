import type { ProductSummary } from '@catalogue/contracts';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { LazyImage } from './LazyImage';
import { Price } from './Price';
import { RatingStars } from './RatingStars';

interface ProductCardProps {
  product: ProductSummary;
  /** Shown over the image, e.g. "No. 1" in a ranked list. */
  label?: string;
  eager?: boolean;
}

export function ProductCard({ product, label, eager }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__media">
          {label && <span className="product-card__rank">{label}</span>}
          <LazyImage src={product.imageUrl} alt="" eager={eager} />
          <span className="product-card__view" aria-hidden="true">
            View details <Icon name="arrowRight" size={16} />
          </span>
        </div>
        <div className="product-card__body">
          <p className="product-card__category">{product.category.name}</p>
          <h3 className="product-card__title">{product.title}</h3>
          <p className="product-card__excerpt">{product.excerpt}</p>
          <div className="product-card__footer">
            <Price price={product.price} className="product-card__price" />
            <RatingStars rating={product.rating} />
          </div>
        </div>
      </Link>
    </article>
  );
}

interface ProductGridProps {
  products: ProductSummary[];
  label: string;
  /** Optional label per position, e.g. ranking in a "top rated" list. */
  labelFor?: (index: number) => string | undefined;
  /** How many leading images to load eagerly (likely above the fold). */
  eagerCount?: number;
  columns?: 3 | 4 | 5;
}

export function ProductGrid({ products, label, labelFor, eagerCount = 4, columns = 4 }: ProductGridProps) {
  return (
    <ul className={`product-grid${columns === 4 ? '' : ` product-grid--${columns}`}`} aria-label={label}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} label={labelFor?.(index)} eager={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}

export const rankLabel = (index: number) => `No. ${index + 1}`;
