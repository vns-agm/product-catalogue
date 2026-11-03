import { useCallback, useEffect, useState } from 'react';
import { ApiRequestError } from '../api/client';

export type ApiState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: ApiRequestError; retry: () => void }
  | { status: 'success'; data: T };

/**
 * Minimal data-fetching hook: loading / error / success, ignores stale
 * responses when inputs change. Swap for TanStack Query when caching or
 * mutations get more involved.
 */
export function useApi<T>(load: () => Promise<T>, deps: unknown[]): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let current = true;
    setState({ status: 'loading' });
    load().then(
      (data) => current && setState({ status: 'success', data }),
      (error: unknown) =>
        current &&
        setState({
          status: 'error',
          error:
            error instanceof ApiRequestError
              ? error
              : new ApiRequestError(0, 'unknown_error', 'Something went wrong.'),
          retry,
        }),
    );
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return state;
}
