import type { CategorySummary } from '@catalogue/contracts';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { LazyImage } from './LazyImage';

/** A category as an editorial card: a collage of its best-rated products, its name and size. */
export function CategoryCard({ category }: { category: CategorySummary }) {
  const previews = category.previewImageUrls.slice(0, 3);
  const count = `${category.productCount} product${category.productCount === 1 ? '' : 's'}`;

  return (
    <Link to={`/categories/${category.slug}`} className="category-card" aria-label={`${category.name}, ${count}`}>
      <div className={`category-card__media category-card__media--${previews.length}`} aria-hidden="true">
        {previews.map((src) => (
          <div key={src} className="category-card__tile">
            <LazyImage src={src} alt="" />
          </div>
        ))}
      </div>
      <div className="category-card__body">
        <div>
          <h3 className="category-card__name">{category.name}</h3>
          <p className="category-card__count">{count}</p>
        </div>
        <span className="category-card__cta" aria-hidden="true">
          Explore <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Link>
  );
}

export function CategoryGrid({ categories }: { categories: CategorySummary[] }) {
  return (
    <ul className="category-grid" aria-label="Shop by category">
      {categories.map((category) => (
        <li key={category.slug}>
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
        <li key={i} className="skeleton-card">
          <div className="skeleton skeleton--media" />
          <div className="skeleton skeleton--line mid" />
        </li>
      ))}
    </ul>
  );
}
