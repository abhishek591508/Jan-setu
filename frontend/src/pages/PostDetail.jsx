import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { mediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import MapFeed from '../components/MapFeed';

export default function PostDetail() {
  const { id } = useParams();
  const { user, refreshMe } = useAuth();
  const [post, setPost] = useState(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [proofs, setProofs] = useState([]);

  const load = () =>
    api.get(`/posts/${id}`).then((res) => {
      setPost(res.data.post);
      setHasUpvoted(res.data.hasUpvoted);
    });

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Issue not found'));
  }, [id]);

  const upvote = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/posts/${id}/upvote`);
      setPost(data.post);
      setHasUpvoted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upvote');
    } finally {
      setBusy(false);
    }
  };

  const claim = async () => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/posts/${id}/claim`);
      setPost(data.post);
      setMessage('You claimed this issue.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not claim');
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      [...proofs].forEach((file) => data.append('proofs', file));
      const res = await api.post(`/posts/${id}/resolve`, data);
      setPost(res.data.post);
      setMessage(`Marked resolved. Civic score +${res.data.civicScoreAwarded} for reporter and resolver.`);
      await refreshMe();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve');
    } finally {
      setBusy(false);
    }
  };

  if (!post) {
    return <p className="text-muted">{error || 'Loading issue...'}</p>;
  }

  const [lng, lat] = post.location?.coordinates || [77.209, 28.6139];
  const canUpvote = user.role === 'civilian' && post.status !== 'resolved' && !hasUpvoted;
  const isStaff = user.role === 'authority' || user.role === 'admin';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <img src={mediaUrl(post.image?.url)} alt="" className="h-64 w-full rounded-xl object-cover" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold text-navy">{post.title}</h1>
          <StatusBadge status={post.status} />
        </div>
        <p className="text-muted">{post.description}</p>
        <div className="flex flex-wrap gap-2 text-sm text-muted">
          <span className="rounded bg-navy/5 px-2 py-1">{post.category}</span>
          <span>{post.upvoteCount} upvotes</span>
          <span>Radius {post.visibilityRadiusKm} km</span>
          <span>Rank {post.rankScore?.toFixed?.(1) || post.rankScore}</span>
          {post.escalationLevel > 0 && <span className="text-saffron-600">Escalation L{post.escalationLevel}</span>}
          {post.city && <span>{post.city}</span>}
        </div>
        <p className="text-sm text-muted">
          Reported by {post.createdBy?.name || 'citizen'} · civic score {post.createdBy?.civicScore ?? 0}
        </p>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-md bg-civic/10 px-3 py-2 text-sm text-civic">{message}</p>}

        {canUpvote && (
          <button
            type="button"
            disabled={busy}
            onClick={upvote}
            className="rounded-lg bg-saffron px-4 py-2 font-semibold text-navy disabled:opacity-60"
          >
            Upvote this issue
          </button>
        )}
        {hasUpvoted && user.role === 'civilian' && (
          <p className="text-sm font-medium text-civic">You already backed this issue.</p>
        )}

        {isStaff && post.status !== 'resolved' && (
          <div className="space-y-3 border-t border-black/5 pt-4">
            {post.status === 'open' && (
              <button
                type="button"
                disabled={busy}
                onClick={claim}
                className="rounded-lg border border-navy px-4 py-2 font-semibold text-navy"
              >
                Claim / mark in progress
              </button>
            )}
            <form onSubmit={resolve} className="space-y-2">
              <label className="block text-sm font-medium">
                Resolution proofs (image, audio, video, or PDF)
                <input
                  type="file"
                  multiple
                  accept="image/*,audio/*,video/*,application/pdf"
                  onChange={(e) => setProofs(e.target.files)}
                  className="mt-1 block w-full text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-civic px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Mark resolved
              </button>
            </form>
          </div>
        )}

        {post.resolutionProofs?.length > 0 && (
          <div>
            <h2 className="font-semibold text-navy">Proofs</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {post.resolutionProofs.map((proof, i) => (
                <li key={proof.publicId || i}>
                  <a className="text-saffron-600 underline" href={mediaUrl(proof.url)} target="_blank" rel="noreferrer">
                    {proof.mediaType} proof {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/" className="inline-block text-sm text-navy underline">
          Back to nearby feed
        </Link>
      </article>

      <MapFeed center={{ lat, lng }} posts={[post]} height="360px" />
    </div>
  );
}
