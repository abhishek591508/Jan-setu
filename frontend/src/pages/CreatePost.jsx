import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import useGeolocation from '../hooks/useGeolocation';
import MapFeed from '../components/MapFeed';

const CATEGORIES = [
  { id: 'roads', label: 'Roads' },
  { id: 'electricity', label: 'Street lights / electricity' },
  { id: 'water', label: 'Water' },
  { id: 'sanitation', label: 'Sanitation' },
  { id: 'general', label: 'General' },
];

export default function CreatePost() {
  const geo = useGeolocation();
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'roads',
    address: '',
    city: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const lat = picked?.lat ?? geo.lat;
  const lng = picked?.lng ?? geo.lng;

  const onFile = (e) => {
    const next = e.target.files?.[0];
    setFile(next || null);
    setPreview(next ? URL.createObjectURL(next) : '');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please attach a photo of the issue');
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('lat', String(lat));
      data.append('lng', String(lng));
      data.append('image', file);
      const res = await api.post('/posts', data);
      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish this report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Report a nearby issue</h1>
        <p className="text-sm text-muted">Snap a photo. We will pin it to your current location.</p>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="block text-sm font-medium">
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Broken road near society gate"
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          What happened?
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Landmark / address
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            City
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="mt-1 w-full text-sm"
          />
        </label>
        {preview && <img src={preview} alt="preview" className="h-40 w-full rounded-lg object-cover" />}
        <p className="text-xs text-muted">
          Pin: {lat.toFixed(5)}, {lng.toFixed(5)}. Tap the map to adjust.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-navy py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Publishing...' : 'Publish report'}
        </button>
      </form>

      <div className="min-h-[480px]">
        <MapFeed
          center={{ lat, lng }}
          pickable
          picked={picked}
          onPick={setPicked}
          height="480px"
        />
      </div>
    </div>
  );
}
