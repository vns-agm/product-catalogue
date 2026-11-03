import type { SVGProps } from 'react';

/** Thin-line icons drawn on a 24px grid. Decorative unless given a `title`. */
const PATHS = {
  search: 'm20 20-4.2-4.2M10.8 17.6a6.8 6.8 0 1 1 0-13.6 6.8 6.8 0 0 1 0 13.6Z',
  arrowRight: 'M4 12h15m-5.5-6 6 6-6 6',
  arrowUp: 'M12 20V5m-6 6 6-6 6 6',
  menu: 'M3.5 7h17M3.5 12h17M3.5 17h17',
  close: 'm6 6 12 12M18 6 6 18',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  chat: 'M20 12a7.5 7.5 0 0 1-11 6.6L4 20l1.4-4.6A7.5 7.5 0 1 1 20 12Z',
  shield: 'M12 3.5 5 6.3v5.3c0 4.3 2.9 7.7 7 8.9 4.1-1.2 7-4.6 7-8.9V6.3L12 3.5Z',
  image: 'M4 5.5h16v13H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17',
  star: 'm12 3.8 2.5 5.1 5.6.8-4 4 1 5.5-5.1-2.7-5 2.7.9-5.5-4-4 5.6-.8L12 3.8Z',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  title?: string;
}

export function Icon({ name, size = 18, title, ...rest }: IconProps) {
  const filled = name === 'star';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path d={PATHS[name]} />
    </svg>
  );
}
