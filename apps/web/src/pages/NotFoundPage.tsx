import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Status';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page-pad">
      <EmptyState
        title="Page not found"
        message="The page you're looking for doesn't exist or has moved."
        action={
          <Link to="/" className="button">
            Back to the catalogue
          </Link>
        }
      />
    </div>
  );
}
