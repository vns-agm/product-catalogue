import { type MouseEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { EnquiryForm } from '../components/EnquiryForm';
import { Icon } from '../components/Icon';
import { LazyImage } from '../components/LazyImage';
import { Price } from '../components/Price';
import { RatingStars } from '../components/RatingStars';
import { ProductDetailSkeleton } from '../components/Skeleton';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function ProductPage() {
  const { id = '' } = useParams();
  const page = useApi(() => api.product(id), [id]);
  const [enquiring, setEnquiring] = useState(false);
  useDocumentTitle(page.status === 'success' ? page.data.product.title : 'Product');

  return (
    <AsyncContent state={page} fallback={<ProductDetailSkeleton />}>
      {({ product }) => (
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/categories/${product.category.slug}`}>{product.category.name}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.title}</span>
          </nav>

          <article className="product-detail">
            <ZoomableImage src={product.imageUrl} alt={product.title} />

            <div className="product-detail__info">
              <Link to={`/categories/${product.category.slug}`} className="eyebrow eyebrow--link">
                {product.category.name}
              </Link>
              <h1 className="display product-detail__title">{product.title}</h1>
              <RatingStars rating={product.rating} />
              <Price price={product.price} className="product-detail__price" />
              <p className="product-detail__description">{product.description}</p>

              {enquiring ? (
                <EnquiryForm product={product} />
              ) : (
                <div className="product-detail__actions">
                  <button type="button" className="button button--large" onClick={() => setEnquiring(true)}>
                    Enquire
                  </button>
                  <Link to={`/categories/${product.category.slug}`} className="button button--secondary button--large">
                    More like this
                  </Link>
                </div>
              )}

              <dl className="product-detail__specs">
                <div>
                  <dt>Category</dt>
                  <dd>{product.category.name}</dd>
                </div>
                <div>
                  <dt>Customer rating</dt>
                  <dd>
                    {product.rating.average.toFixed(1)} / 5 · {product.rating.count} reviews
                  </dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd>No. {product.id.padStart(4, '0')}</dd>
                </div>
              </dl>

              <p className="product-detail__note">
                <Icon name="chat" />
                A specialist replies to every enquiry personally, within one business day.
              </p>
              <p className="product-detail__note">
                <Icon name="shield" />
                Your details are only used to reply to your enquiry.
              </p>
            </div>
          </article>
        </div>
      )}
    </AsyncContent>
  );
}

/** Hover (or tap) to zoom into the image where the pointer is. */
function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);

  function track(event: MouseEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--zoom-x', `${((event.clientX - box.left) / box.width) * 100}%`);
    event.currentTarget.style.setProperty('--zoom-y', `${((event.clientY - box.top) / box.height) * 100}%`);
  }

  return (
    <div
      className={`product-detail__media${zoomed ? ' is-zoomed' : ''}`}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={track}
      onClick={() => setZoomed((z) => !z)}
    >
      <LazyImage src={src} alt={alt} eager />
    </div>
  );
}
