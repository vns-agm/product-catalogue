import type { ReactNode } from 'react';
import type { ApiState } from '../hooks/useApi';
import { Icon, type IconName } from './Icon';
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
    const notFound = state.error.status === 404;
    return (
      <div className="container">
        <EmptyState
          role="alert"
          tone="error"
          title={notFound ? 'Not found' : 'Something went wrong'}
          message={state.error.message}
          action={
            !notFound && (
              <button type="button" className="button button--secondary" onClick={state.retry}>
                Try again
              </button>
            )
          }
        />
      </div>
    );
  }
  return <>{children(state.data)}</>;
}

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: IconName;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
  role?: 'alert' | 'status';
}

export function EmptyState({ title, message, icon = 'search', action, tone = 'neutral', role }: EmptyStateProps) {
  return (
    <div className={`empty-state${tone === 'error' ? ' empty-state--error' : ''}`} role={role}>
      <Icon name={icon} size={28} />
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
