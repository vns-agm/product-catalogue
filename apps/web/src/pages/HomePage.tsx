import { api } from '../api/client';
import { ProductGrid } from '../components/ProductCard';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function HomePage() {
  useDocumentTitle('Home');
  const featured = useApi(() => api.featured(), []);

  return (
    <section aria-labelledby="featured-heading">
      <h1 id="featured-heading">Top rated</h1>
      <p className="lede">Our hand-picked favourites.</p>
      <AsyncContent state={featured}>
        {({ products }) => <ProductGrid products={products} label="Top rated products" />}
      </AsyncContent>
    </section>
  );
}
