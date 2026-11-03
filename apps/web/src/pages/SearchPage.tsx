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
    return <p className="status">Enter a search term above to find products.</p>;
  }

  return (
    <AsyncContent state={results}>
      {(data) => (
        <section aria-labelledby="search-heading">
          <h1 id="search-heading">
            {data?.products.length ?? 0} result{data?.products.length === 1 ? '' : 's'} for “{query}”
          </h1>
          {data && data.products.length > 0 ? (
            <ProductGrid products={data.products} label="Search results" />
          ) : (
            <p className="status">No products match that search. Try a different term.</p>
          )}
        </section>
      )}
    </AsyncContent>
  );
}
