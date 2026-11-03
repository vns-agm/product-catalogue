import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  /** Above-the-fold images load immediately instead of waiting to scroll into view. */
  eager?: boolean;
}

/**
 * Native lazy loading plus a shimmer placeholder while the image downloads,
 * a fade-in once it arrives, and a neutral fallback if it fails.
 */
export function LazyImage({ src, alt, eager = false }: LazyImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStatus('loading');
    // A cached image can finish before React attaches onLoad.
    if (ref.current?.complete && ref.current.naturalWidth > 0) setStatus('loaded');
  }, [src]);

  return (
    <div className={`lazy-image is-${status}`}>
      {status === 'error' ? (
        <svg className="lazy-image__fallback" width="40" height="40" viewBox="0 0 24 24" aria-label={alt} role="img">
          <path
            fill="currentColor"
            d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5Z"
          />
        </svg>
      ) : (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}
