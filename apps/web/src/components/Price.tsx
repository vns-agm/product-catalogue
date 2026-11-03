import type { Money } from '@catalogue/contracts';

interface PriceProps {
  price: Money;
  className?: string;
  as?: 'p' | 'span' | 'strong';
}

export function Price({ price, className, as: Tag = 'p' }: PriceProps) {
  const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: price.currency }).format(
    price.amount,
  );
  return <Tag className={className}>{formatted}</Tag>;
}
