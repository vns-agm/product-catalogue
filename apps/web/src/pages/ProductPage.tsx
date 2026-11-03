import { type MouseEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { EnquiryForm } from '../components/EnquiryForm';
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
        <>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/categories/${product.category.slug}`}>{product.category.name}</Link>
          </nav>
          <article className="product-detail">
            <ZoomableImage src={product.imageUrl} alt={product.title} />
            <div className="product-detail__info">
              <Link to={`/categories/${product.category.slug}`} className="product-detail__category">
                {product.category.name}
              </Link>
              <h1>{product.title}</h1>
              <RatingStars rating={product.rating} />
              <Price price={product.price} className="product-detail__price gradient-text" />
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

              <ul className="product-detail__perks">
                <li>💬 Replies within one business day</li>
                <li>🔒 Your details are only used to reply</li>
              </ul>
            </div>
          </article>
        </>
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
      <span className="product-detail__zoom-hint" aria-hidden="true">
        Hover to zoom
      </span>
    </div>
  );
}
