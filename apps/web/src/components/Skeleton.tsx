/** Placeholders that match the real layout, so content never shifts when it arrives. */
export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: 3 | 4 | 5 }) {
  return (
    <ul className={`product-grid${columns === 4 ? '' : ` product-grid--${columns}`}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="skeleton-card">
          <div className="skeleton skeleton--media" />
          <div className="skeleton-card__body">
            <div className="skeleton skeleton--line short" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line mid" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PageSkeleton() {
  return (
    <div className="container" role="status" aria-label="Loading">
      <div className="page-header">
        <div className="skeleton skeleton--line short" />
        <div className="skeleton skeleton--title" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container product-detail" role="status" aria-label="Loading">
      <div className="skeleton skeleton--media" style={{ aspectRatio: '4 / 4.6' }} />
      <div className="product-detail__info">
        <div className="skeleton skeleton--line short" />
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line mid" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line mid" />
      </div>
    </div>
  );
}
