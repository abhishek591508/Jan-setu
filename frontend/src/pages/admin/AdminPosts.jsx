import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', city: '' });

  const load = () =>
    api.get('/admin/posts', { params: filters }).then((res) => setPosts(res.data.posts || []));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">All civic issues</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex flex-wrap gap-2"
      >
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Any category</option>
          {['roads', 'electricity', 'water', 'sanitation', 'general'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Upvotes</th>
              <th className="px-3 py-2">Escalation</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Reporter</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-t border-black/5">
                <td className="px-3 py-2">
                  <Link className="font-medium text-navy underline" to={`/posts/${post._id}`}>
                    {post.title}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-3 py-2">{post.upvoteCount}</td>
                <td className="px-3 py-2">L{post.escalationLevel}</td>
                <td className="px-3 py-2">{post.city || '—'}</td>
                <td className="px-3 py-2">{post.createdBy?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
