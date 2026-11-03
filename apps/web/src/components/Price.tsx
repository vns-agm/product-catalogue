import type { Money } from '@catalogue/contracts';

export function Price({ price, className }: { price: Money; className?: string }) {
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: price.currency,
  }).format(price.amount);
  return <p className={className}>{formatted}</p>;
}
