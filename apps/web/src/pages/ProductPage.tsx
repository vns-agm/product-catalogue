import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { EnquiryForm } from '../components/EnquiryForm';
import { Price } from '../components/Price';
import { RatingStars } from '../components/RatingStars';
import { AsyncContent } from '../components/Status';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function ProductPage() {
  const { id = '' } = useParams();
  const page = useApi(() => api.product(id), [id]);
  const [enquiring, setEnquiring] = useState(false);
  useDocumentTitle(page.status === 'success' ? page.data.product.title : 'Product');

  return (
    <AsyncContent state={page}>
      {({ product }) => (
        <article className="product-detail">
          <div className="product-detail__image">
            <img src={product.imageUrl} alt={product.title} />
          </div>
          <div className="product-detail__info">
            <Link to={`/categories/${product.category.slug}`} className="product-detail__category">
              {product.category.name}
            </Link>
            <h1>{product.title}</h1>
            <RatingStars rating={product.rating} />
            <Price price={product.price} className="product-detail__price" />
            <p className="product-detail__description">{product.description}</p>
            {enquiring ? (
              <EnquiryForm product={product} />
            ) : (
              <button type="button" className="button button--large" onClick={() => setEnquiring(true)}>
                Enquire
              </button>
            )}
          </div>
        </article>
      )}
    </AsyncContent>
  );
}
