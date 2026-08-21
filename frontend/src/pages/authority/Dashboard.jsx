import { useEffect, useState } from 'react';
import api from '../../api/client';
import PostCard from '../../components/PostCard';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/posts/dashboard')
      .then((res) => setPosts(res.data.posts || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard'));
  }, []);

  const escalated = posts.filter((p) => p.escalationLevel >= 1);
  const local = posts.filter((p) => p.escalationLevel === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Authority dashboard</h1>
        <p className="text-sm text-muted">
          Local jurisdiction work plus issues that crossed upvote/time thresholds.
        </p>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <section>
        <h2 className="mb-3 font-semibold text-saffron-600">Escalated</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {escalated.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          {escalated.length === 0 && (
            <p className="text-sm text-muted">No escalated issues in your department yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-navy">In your jurisdiction</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {local.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          {local.length === 0 && <p className="text-sm text-muted">No local open issues.</p>}
        </div>
      </section>
    </div>
  );
}
