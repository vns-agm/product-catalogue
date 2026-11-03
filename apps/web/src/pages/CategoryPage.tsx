import type { ProductSummary } from '@catalogue/contracts';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ProductGrid } from '../components/ProductCard';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SORTS = {
  rating: { label: 'Best rated', compare: (a: ProductSummary, b: ProductSummary) => b.rating.average - a.rating.average },
  'price-asc': { label: 'Price: low to high', compare: (a: ProductSummary, b: ProductSummary) => a.price.amount - b.price.amount },
  'price-desc': { label: 'Price: high to low', compare: (a: ProductSummary, b: ProductSummary) => b.price.amount - a.price.amount },
} as const;
type SortKey = keyof typeof SORTS;

export function CategoryPage() {
  const { slug = '' } = useParams();
  const page = useApi(() => api.category(slug), [slug]);
  useDocumentTitle(page.status === 'success' ? page.data.category.name : 'Category');

  // Sort lives in the URL so it survives refresh and can be shared.
  const [params, setParams] = useSearchParams();
  const sort: SortKey = (params.get('sort') as SortKey) in SORTS ? (params.get('sort') as SortKey) : 'rating';

  const more = useMemo(
    () => (page.status === 'success' ? [...page.data.more].sort(SORTS[sort].compare) : []),
    [page, sort],
  );

  return (
    <AsyncContent state={page}>
      {({ category, topRated }) => (
        <>
          <h1>
            <span className="gradient-text">{category.name}</span>
          </h1>
          <p className="lede">
            {topRated.length + more.length} products · our best rated first
          </p>

          <section aria-labelledby="top-rated-heading">
            <div className="section-head">
              <h2 id="top-rated-heading">Top rated in {category.name}</h2>
            </div>
            <ProductGrid
              products={topRated}
              label={`Top rated in ${category.name}`}
              badgeFor={(i) => `#${i + 1}`}
            />
          </section>

          {more.length > 0 && (
            <section aria-labelledby="more-heading">
              <div className="section-head">
                <h2 id="more-heading">More in {category.name}</h2>
                <label className="sort">
                  Sort by
                  <select
                    value={sort}
                    onChange={(event) =>
                      setParams((current) => {
                        current.set('sort', event.target.value);
                        return current;
                      }, { replace: true, preventScrollReset: true })
                    }
                  >
                    {Object.entries(SORTS).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ProductGrid products={more} label={`More in ${category.name}`} eagerCount={0} />
            </section>
          )}
        </>
      )}
    </AsyncContent>
  );
}
