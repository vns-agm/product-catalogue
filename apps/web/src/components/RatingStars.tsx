import type { Rating } from '@catalogue/contracts';
import { Icon } from './Icon';

export function RatingStars({ rating }: { rating: Rating }) {
  const label = `Rated ${rating.average.toFixed(1)} out of 5 from ${rating.count} reviews`;
  return (
    <p className="rating" aria-label={label} title={label}>
      <Icon name="star" size={13} />
      <span aria-hidden="true">{rating.average.toFixed(1)}</span>
      <span className="rating__count" aria-hidden="true">
        ({rating.count})
      </span>
    </p>
  );
}
