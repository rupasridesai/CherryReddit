import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

const NotFound = () => (
  <div style={{ maxWidth: 480, margin: '60px auto' }}>
    <EmptyState
      emoji="🍒"
      title="Page not found"
      subtitle="This branch of the orchard doesn't exist."
      action={
        <Link to="/" className="btn btn-primary">
          Back to feed
        </Link>
      }
    />
  </div>
);

export default NotFound;
