import type { ProductSummary } from '@catalogue/contracts';
import { Link } from 'react-router-dom';
import { Price } from './Price';
import { RatingStars } from './RatingStars';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__image">
          <img src={product.imageUrl} alt="" loading="lazy" />
        </div>
        <div className="product-card__body">
          <p className="product-card__category">{product.category.name}</p>
          <h3 className="product-card__title">{product.title}</h3>
          <RatingStars rating={product.rating} />
          <Price price={product.price} className="product-card__price" />
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, label }: { products: ProductSummary[]; label: string }) {
  return (
    <ul className="product-grid" aria-label={label}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
