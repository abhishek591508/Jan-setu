import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load stats'));
  }, []);

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Admin overview</h1>
          <p className="text-sm text-muted">Users, authorities, and civic issue volume.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
            Manage users
          </Link>
          <Link to="/admin/posts" className="rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy">
            All posts
          </Link>
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Users', stats.users],
            ['Authorities', stats.authorities],
            ['Posts', stats.posts],
            ['Open', stats.open],
            ['In progress', stats.inProgress],
            ['Resolved', stats.resolved],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-muted">{label}</p>
              <p className="text-3xl font-semibold text-navy">{value}</p>
            </div>
          ))}
        </div>
      )}

      {data?.thresholds && (
        <section className="rounded-xl bg-white p-5 text-sm text-muted shadow-sm">
          <h2 className="mb-2 font-semibold text-navy">Live ranking thresholds</h2>
          <p>Radius grows at 0 / 5 / 15 / 40 upvotes (1, 3, 8, 20 km).</p>
          <p>Level 1 escalation: 10 upvotes after 12h, or 25 upvotes immediately.</p>
          <p>Level 2 escalation: 40 upvotes and still open after 48h.</p>
        </section>
      )}
    </div>
  );
}
