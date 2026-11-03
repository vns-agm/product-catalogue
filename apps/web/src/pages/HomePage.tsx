import { api } from '../api/client';
import { ProductGrid } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function HomePage() {
  useDocumentTitle('Home');
  const featured = useApi(() => api.featured(), []);

  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <p className="hero__eyebrow">New season picks</p>
        <h1 id="hero-heading">
          Find something <span className="gradient-text">you'll love</span>
        </h1>
        <p className="hero__lede">
          Browse our hand-picked favourites below, or pick a category above. See something you like?
          Open it and send us an enquiry.
        </p>
      </section>

      <section aria-labelledby="featured-heading">
        <div className="section-head">
          <div>
            <h2 id="featured-heading">Top rated</h2>
            <p>Our hand-picked favourites.</p>
          </div>
        </div>
        <AsyncContent state={featured} fallback={<ProductGridSkeleton count={5} />}>
          {({ products }) => (
            <ProductGrid products={products} label="Top rated products" badgeFor={(i) => `#${i + 1}`} eagerCount={5} />
          )}
        </AsyncContent>
      </section>
    </>
  );
}
