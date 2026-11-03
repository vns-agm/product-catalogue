import type { ReactNode } from 'react';
import type { ApiState } from '../hooks/useApi';
import { PageSkeleton } from './Skeleton';

/** Renders loading and error states uniformly, and the page content on success. */
export function AsyncContent<T>({
  state,
  children,
  fallback = <PageSkeleton />,
}: {
  state: ApiState<T>;
  children: (data: T) => ReactNode;
  fallback?: ReactNode;
}) {
  if (state.status === 'loading') return <>{fallback}</>;
  if (state.status === 'error') {
    return (
      <div className="empty-state status--error" role="alert">
        <div className="empty-state__icon" aria-hidden="true">⚠︎</div>
        <p>{state.error.message}</p>
        {state.error.status !== 404 && (
          <button type="button" className="button button--secondary" onClick={state.retry}>
            Try again
          </button>
        )}
      </div>
    );
  }
  return <>{children(state.data)}</>;
}
