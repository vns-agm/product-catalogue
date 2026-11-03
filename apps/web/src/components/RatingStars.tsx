import type { CSSProperties } from 'react';
import type { Rating } from '@catalogue/contracts';

export function RatingStars({ rating }: { rating: Rating }) {
  const label = `Rated ${rating.average.toFixed(1)} out of 5 from ${rating.count} reviews`;
  return (
    <p className="rating" aria-label={label} title={label}>
      <span className="rating__stars" aria-hidden="true" style={{ '--rating': rating.average } as CSSProperties} />
      <span className="rating__text" aria-hidden="true">
        {rating.average.toFixed(1)} ({rating.count})
      </span>
    </p>
  );
}
