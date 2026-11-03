import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { ProductGrid } from '../components/ProductCard';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function CategoryPage() {
  const { slug = '' } = useParams();
  const page = useApi(() => api.category(slug), [slug]);
  useDocumentTitle(page.status === 'success' ? page.data.category.name : 'Category');

  return (
    <AsyncContent state={page}>
      {({ category, topRated, more }) => (
        <>
          <h1>{category.name}</h1>
          <section aria-labelledby="top-rated-heading">
            <h2 id="top-rated-heading">Top rated in {category.name}</h2>
            <ProductGrid products={topRated} label={`Top rated in ${category.name}`} />
          </section>
          {more.length > 0 && (
            <section aria-labelledby="more-heading">
              <h2 id="more-heading">More in {category.name}</h2>
              <ProductGrid products={more} label={`More in ${category.name}`} />
            </section>
          )}
        </>
      )}
    </AsyncContent>
  );
}
