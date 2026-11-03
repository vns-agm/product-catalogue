import type React from 'react';
/** Placeholder shapes shown while data loads, so the layout doesn't jump. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="product-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} style={{ '--i': i } as React.CSSProperties}>
          <div className="skeleton-card">
            <div className="skeleton skeleton--media" />
            <div className="skeleton-card__body">
              <div className="skeleton skeleton--line short" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line mid" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <div className="skeleton skeleton--title" />
      <ProductGridSkeleton />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="product-detail" role="status" aria-label="Loading">
      <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius)' }} />
      <div style={{ display: 'grid', gap: '0.9rem', alignContent: 'start' }}>
        <div className="skeleton skeleton--line short" />
        <div className="skeleton skeleton--title" style={{ margin: 0 }} />
        <div className="skeleton skeleton--line mid" />
        <div className="skeleton" style={{ height: '2.2rem', width: '9rem' }} />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line mid" />
      </div>
    </div>
  );
}
