import { type ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Fades its content up as it scrolls into view. Content already on screen at
 * mount (or with reduced motion, or without IntersectionObserver) is shown
 * immediately, so nothing above the fold ever waits on an animation.
 */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'static' | 'hidden' | 'shown'>('static');

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    setState('hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const stateClass = state === 'static' ? '' : ` is-${state}`;
  return (
    <div ref={ref} className={`reveal${stateClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
