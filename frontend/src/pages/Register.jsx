import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const geo = useGeolocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ ...form, lat: geo.lat, lng: geo.lng });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-navy">Create a civilian account</h1>
      <p className="mt-1 text-sm text-muted">Report nearby issues and back the ones that matter to your street.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium">
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Phone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            minLength={6}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <p className="text-xs text-muted">
          {geo.loading ? 'Detecting your location...' : geo.error || 'Location will be saved with your profile.'}
        </p>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-navy py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-saffron-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
