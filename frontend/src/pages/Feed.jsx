import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import MapFeed from '../components/MapFeed';
import PostCard from '../components/PostCard';

export default function Feed() {
  const { user } = useAuth();
  const geo = useGeolocation();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [includeResolved, setIncludeResolved] = useState(false);

  useEffect(() => {
    if (geo.loading) return;
    let cancelled = false;

    api
      .get('/posts/feed', {
        params: { lat: geo.lat, lng: geo.lng, includeResolved },
      })
      .then((res) => {
        if (!cancelled) setPosts(res.data.posts || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load nearby issues');
      });

    return () => {
      cancelled = true;
    };
  }, [geo.loading, geo.lat, geo.lng, includeResolved]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Issues near you</h1>
          <p className="text-sm text-muted">
            Ranked by distance, upvotes, and how fast support is growing.
            {geo.error ? ` ${geo.error}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={includeResolved}
              onChange={(e) => setIncludeResolved(e.target.checked)}
            />
            Show resolved
          </label>
          {user?.role === 'civilian' && (
            <Link
              to="/report"
              className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-navy"
            >
              Report an issue
            </Link>
          )}
        </div>
      </div>

      <MapFeed center={{ lat: geo.lat, lng: geo.lng }} posts={posts} />

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {posts.length === 0 && !error && !geo.loading && (
        <p className="rounded-xl bg-white p-6 text-center text-muted shadow-sm">
          No open issues in this radius yet. Be the first to report one.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} distance={post.distance} />
        ))}
      </div>
    </div>
  );
}
