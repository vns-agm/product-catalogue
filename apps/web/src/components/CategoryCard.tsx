import type { CategorySummary } from '@catalogue/contracts';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from './LazyImage';

/** A category as a card: a collage of its best-rated products, its name and size. */
export function CategoryCard({ category }: { category: CategorySummary }) {
  const previews = category.previewImageUrls.slice(0, 3);
  const count = `${category.productCount} product${category.productCount === 1 ? '' : 's'}`;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="category-card"
      aria-label={`${category.name}, ${count}`}
    >
      <div className={`category-card__preview category-card__preview--${previews.length}`} aria-hidden="true">
        {previews.map((src, index) => (
          <div key={src} className="category-card__tile">
            <LazyImage src={src} alt="" eager={index === 0} />
          </div>
        ))}
      </div>
      <div className="category-card__body">
        <div>
          <h3 className="category-card__name">{category.name}</h3>
          <p className="category-card__count">{count}</p>
        </div>
        <span className="category-card__arrow" aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
}

export function CategoryGrid({ categories }: { categories: CategorySummary[] }) {
  return (
    <ul className="category-grid" aria-label="Shop by category">
      {categories.map((category, index) => (
        <li key={category.slug} style={{ '--i': index } as CSSProperties}>
          <CategoryCard category={category} />
        </li>
      ))}
    </ul>
  );
}

export function CategoryGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="category-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="skeleton" style={{ aspectRatio: '4 / 3.6', borderRadius: 'var(--radius)' }} />
        </li>
      ))}
    </ul>
  );
}
