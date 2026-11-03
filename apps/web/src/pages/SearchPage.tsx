import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ProductGrid } from '../components/ProductCard';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  useDocumentTitle(query ? `Search: ${query}` : 'Search');
  const results = useApi(() => (query ? api.search(query) : Promise.resolve(null)), [query]);

  if (!query) {
    return (
      <div className="empty-state" style={{ marginTop: '2rem' }}>
        <div className="empty-state__icon" aria-hidden="true">🔍</div>
        <p>Enter a search term above to find products.</p>
      </div>
    );
  }

  return (
    <AsyncContent state={results}>
      {(data) => (
        <section aria-labelledby="search-heading">
          <h1 id="search-heading">
            {data?.products.length ?? 0} result{data?.products.length === 1 ? '' : 's'} for{' '}
            <span className="gradient-text">“{query}”</span>
          </h1>
          {data && data.products.length > 0 ? (
            <ProductGrid products={data.products} label="Search results" />
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">🛍️</div>
              <p>No products match that search. Try a different term.</p>
            </div>
          )}
        </section>
      )}
    </AsyncContent>
  );
}
