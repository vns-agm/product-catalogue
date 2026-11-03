import type { ReactNode } from 'react';
import type { ApiState } from '../hooks/useApi';

/** Renders loading and error states uniformly, and the page content on success. */
export function AsyncContent<T>({ state, children }: { state: ApiState<T>; children: (data: T) => ReactNode }) {
  if (state.status === 'loading') {
    return (
      <p className="status" role="status">
        Loading…
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="status status--error" role="alert">
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
