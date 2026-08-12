import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <EmptyState
        title="404 — This ticket's been torn up"
        description="The page you're looking for doesn't exist or has moved."
        action={<Link to="/" className="btn-primary">Back to home</Link>}
      />
    </div>
  );
}
