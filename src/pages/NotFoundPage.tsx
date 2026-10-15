import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="not-found-page">
      <div className="not-found-code">404</div>
      <h1>Page not found</h1>
      <p>
        This page doesn't exist, or the address may be incorrect.
      </p>
      <Link to={isAuthenticated ? '/' : '/login'}>
        <Button>
          <ArrowLeft size={16} />
          {isAuthenticated ? 'Back to dashboard' : 'Go to login'}
        </Button>
      </Link>
    </main>
  );
}
