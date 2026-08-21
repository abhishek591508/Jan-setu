import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState({ posts: [], resolved: [] });

  useEffect(() => {
    api.get(`/users/${user.id}`).then((res) => setData(res.data));
  }, [user.id]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-navy p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-wide text-white/70">{user.role}</p>
        <h1 className="text-3xl font-semibold">{user.name}</h1>
        <p className="mt-1 text-white/80">{user.email}</p>
        <p className="mt-4 text-4xl font-bold text-saffron">{user.civicScore}</p>
        <p className="text-sm text-white/70">Civic score</p>
        {user.role === 'authority' && (
          <p className="mt-3 text-sm text-white/80">
            {user.department} · level {user.level} · {user.jurisdiction?.city || 'no city set'} ·
            radius {user.jurisdiction?.radiusKm || 5} km
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">Reports you filed</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(data.posts || []).map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          {data.posts?.length === 0 && <p className="text-sm text-muted">No reports yet.</p>}
        </div>
      </section>

      {user.role !== 'civilian' && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-navy">Issues you resolved</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(data.resolved || []).map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {data.resolved?.length === 0 && <p className="text-sm text-muted">None resolved yet.</p>}
          </div>
        </section>
      )}
    </div>
  );
}
