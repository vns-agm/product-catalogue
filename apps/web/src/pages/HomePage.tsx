import type { ProductSummary } from '@catalogue/contracts';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { CategoryGrid, CategoryGridSkeleton } from '../components/CategoryCard';
import { Icon } from '../components/Icon';
import { LazyImage } from '../components/LazyImage';
import { Price } from '../components/Price';
import { ProductGrid, rankLabel } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { ProductGridSkeleton } from '../components/Skeleton';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function HomePage() {
  useDocumentTitle('Home');
  const featured = useApi(() => api.featured(), []);
  const categories = useApi(() => api.categories(), []);

  const featuredProducts = featured.status === 'success' ? featured.data.products : [];
  const categoryList = categories.status === 'success' ? categories.data.categories : null;
  const productTotal = categoryList?.reduce((sum, category) => sum + category.productCount, 0);

  return (
    <>
      <section className="container hero" aria-labelledby="hero-heading">
        <div className="hero__copy">
          <p className="eyebrow">The curated edit</p>
          <h1 id="hero-heading" className="display hero__title">
            Considered pieces, <em>chosen</em> with care.
          </h1>
          <p className="lede">
            Clothing, jewellery and technology selected for quality and longevity. Browse the catalogue and send
            an enquiry. A specialist replies to every one personally.
          </p>
          <div className="hero__actions">
            <a href="#top-rated" className="button button--large">
              Explore the collection <Icon name="arrowRight" size={17} />
            </a>
            <a href="#categories" className="button button--secondary button--large">
              Browse categories
            </a>
          </div>
          <dl className="hero__facts">
            <div>
              <dt>Curated products</dt>
              <dd>{productTotal ?? '—'}</dd>
            </div>
            <div>
              <dt>Categories</dt>
              <dd>{categoryList?.length ?? '—'}</dd>
            </div>
            <div>
              <dt>Reply time</dt>
              <dd>24h</dd>
            </div>
          </dl>
        </div>
        <HeroGallery products={featuredProducts.slice(0, 3)} loading={featured.status === 'loading'} />
      </section>

      <section id="categories" className="container section" aria-labelledby="categories-heading">
        <Reveal>
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">Collections</p>
              <h2 id="categories-heading" className="section-title">
                Shop by category
              </h2>
              <p>Each collection opens with its best-rated pieces.</p>
            </div>
          </div>
          <AsyncContent state={categories} fallback={<CategoryGridSkeleton />}>
            {(data) => <CategoryGrid categories={data.categories} />}
          </AsyncContent>
        </Reveal>
      </section>

      <section id="top-rated" className="container section" aria-labelledby="featured-heading">
        <Reveal>
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">Top rated</p>
              <h2 id="featured-heading" className="section-title">
                The most loved pieces
              </h2>
              <p>Five products our customers rate most highly, hand-picked by our team.</p>
            </div>
          </div>
          <AsyncContent state={featured} fallback={<ProductGridSkeleton count={5} columns={5} />}>
            {({ products }) => (
              <ProductGrid
                products={products}
                label="Top rated products"
                labelFor={rankLabel}
                eagerCount={0}
                columns={5}
              />
            )}
          </AsyncContent>
        </Reveal>
      </section>

      <section id="story" className="container section" aria-labelledby="story-heading">
        <Reveal>
          <div className="story">
            <div className="story__media" aria-hidden="true">
              {featuredProducts[3] && <LazyImage src={featuredProducts[3].imageUrl} alt="" />}
            </div>
            <div className="story__copy">
              <p className="eyebrow">Our approach</p>
              <h2 id="story-heading" className="section-title">
                Fewer things, chosen better.
              </h2>
              <p className="lede">
                We would rather show you twenty products we believe in than two thousand we don't. Every piece
                is selected for how it's made and how long it lasts.
              </p>
              <ol className="story__principles">
                <li>
                  <span className="story__num">01</span>
                  <h3>Curated, not crowded</h3>
                  <p>A small, edited selection in every category.</p>
                </li>
                <li>
                  <span className="story__num">02</span>
                  <h3>Honest detail</h3>
                  <p>Clear descriptions, real ratings and transparent prices.</p>
                </li>
                <li>
                  <span className="story__num">03</span>
                  <h3>Personal service</h3>
                  <p>Every enquiry is answered by a person, within one business day.</p>
                </li>
              </ol>
              <Link to="/#categories" className="link-arrow">
                Start browsing <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/** One tall frame and two stacked ones, using the first three featured products. */
function HeroGallery({ products, loading }: { products: ProductSummary[]; loading: boolean }) {
  if (loading || products.length === 0) {
    return (
      <div className="hero__gallery hero__gallery--loading" aria-hidden="true">
        <div className="hero__frame" />
        <div className="hero__frame" />
        <div className="hero__frame" />
      </div>
    );
  }
  return (
    <div className="hero__gallery">
      {products.map((product, index) => (
        <Link key={product.id} to={`/products/${product.id}`} className="hero__frame" aria-label={product.title}>
          <LazyImage src={product.imageUrl} alt="" eager />
          {index === 0 && (
            <span className="hero__caption" aria-hidden="true">
              <span>{product.title}</span>
              <Price price={product.price} as="strong" />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
