import { Link } from 'react-router-dom';
import { mediaUrl } from '../api/client';
import StatusBadge from './StatusBadge';

const categoryLabel = {
  roads: 'Roads',
  electricity: 'Electricity',
  water: 'Water',
  sanitation: 'Sanitation',
  general: 'General',
};

export default function PostCard({ post, distance }) {
  const km = typeof distance === 'number' ? (distance / 1000).toFixed(1) : null;

  return (
    <Link
      to={`/posts/${post._id}`}
      className="flex overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={mediaUrl(post.image?.url)}
        alt={post.title}
        className="h-32 w-32 shrink-0 object-cover"
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-navy">{post.title}</h3>
          <StatusBadge status={post.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted">{post.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded bg-navy/5 px-2 py-0.5">{categoryLabel[post.category]}</span>
          <span>{post.upvoteCount} upvotes</span>
          {post.escalationLevel > 0 && (
            <span className="font-medium text-saffron-600">Escalated L{post.escalationLevel}</span>
          )}
          {km && <span>{km} km away</span>}
          {post.city && <span>{post.city}</span>}
        </div>
      </div>
    </Link>
  );
}
