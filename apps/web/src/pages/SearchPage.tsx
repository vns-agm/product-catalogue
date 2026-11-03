import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ProductGrid } from '../components/ProductCard';
import { AsyncContent, EmptyState } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  useDocumentTitle(query ? `Search: ${query}` : 'Search');
  const results = useApi(() => (query ? api.search(query) : Promise.resolve(null)), [query]);

  if (!query) {
    return (
      <div className="container page-pad">
        <EmptyState title="Search the catalogue" message="Enter a search term above to find products." />
      </div>
    );
  }

  return (
    <AsyncContent state={results}>
      {(data) => {
        const count = data?.products.length ?? 0;
        return (
          <div className="container">
            <header className="page-header">
              <p className="eyebrow">Search</p>
              <h1 id="search-heading" className="display page-header__title">
                {count} result{count === 1 ? '' : 's'} for “{query}”
              </h1>
            </header>
            {data && count > 0 ? (
              <section className="section" aria-labelledby="search-heading">
                <ProductGrid products={data.products} label="Search results" />
              </section>
            ) : (
              <EmptyState
                title="No matches"
                message="No products match that search. Try a different term, or browse a category."
              />
            )}
          </div>
        );
      }}
    </AsyncContent>
  );
}
