import type { ProductSummary } from '@catalogue/contracts';
import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ProductGrid, rankLabel } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SORTS = {
  rating: { label: 'Best rated', compare: (a: ProductSummary, b: ProductSummary) => b.rating.average - a.rating.average },
  'price-asc': { label: 'Price: low to high', compare: (a: ProductSummary, b: ProductSummary) => a.price.amount - b.price.amount },
  'price-desc': { label: 'Price: high to low', compare: (a: ProductSummary, b: ProductSummary) => b.price.amount - a.price.amount },
} as const;
type SortKey = keyof typeof SORTS;
const isSortKey = (value: string | null): value is SortKey => value !== null && value in SORTS;

export function CategoryPage() {
  const { slug = '' } = useParams();
  const page = useApi(() => api.category(slug), [slug]);
  useDocumentTitle(page.status === 'success' ? page.data.category.name : 'Category');

  // Sort lives in the URL so it survives refresh and can be shared.
  const [params, setParams] = useSearchParams();
  const requested = params.get('sort');
  const sort: SortKey = isSortKey(requested) ? requested : 'rating';

  const more = useMemo(
    () => (page.status === 'success' ? [...page.data.more].sort(SORTS[sort].compare) : []),
    [page, sort],
  );

  return (
    <AsyncContent state={page}>
      {({ category, topRated }) => (
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{category.name}</span>
          </nav>
          <header className="page-header">
            <p className="eyebrow">Collection</p>
            <h1 className="display page-header__title">{category.name}</h1>
            <p className="page-header__meta">
              {topRated.length + more.length} products, best rated first.
            </p>
          </header>

          <section className="section" aria-labelledby="top-rated-heading">
            <div className="section-head">
              <h2 id="top-rated-heading" className="section-title">
                Top rated in {category.name}
              </h2>
            </div>
            <ProductGrid
              products={topRated}
              label={`Top rated in ${category.name}`}
              labelFor={rankLabel}
              columns={3}
              eagerCount={3}
            />
          </section>

          {more.length > 0 && (
            <section className="section" aria-labelledby="more-heading">
              <Reveal>
                <div className="section-head">
                  <h2 id="more-heading" className="section-title">
                    More in {category.name}
                  </h2>
                  <label className="sort">
                    Sort by
                    <select
                      value={sort}
                      onChange={(event) =>
                        setParams(
                          (current) => {
                            current.set('sort', event.target.value);
                            return current;
                          },
                          { replace: true, preventScrollReset: true },
                        )
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
              </Reveal>
            </section>
          )}
        </div>
      )}
    </AsyncContent>
  );
}
