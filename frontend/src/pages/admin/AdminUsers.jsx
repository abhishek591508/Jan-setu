import { useEffect, useState } from 'react';
import api from '../../api/client';

const emptyAuthority = {
  name: '',
  email: '',
  password: '',
  phone: '',
  department: 'roads',
  city: '',
  lat: '',
  lng: '',
  radiusKm: 5,
  level: 1,
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyAuthority);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => api.get('/admin/users').then((res) => setUsers(res.data.users || []));

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Could not load users'));
  }, []);

  const createAuthority = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/admin/authorities', form);
      setForm(emptyAuthority);
      setMessage('Authority account created and approved.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create authority');
    }
  };

  const patchUser = async (id, body) => {
    await api.patch(`/admin/users/${id}`, body);
    await load();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-navy">Users and authorities</h1>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-md bg-civic/10 px-3 py-2 text-sm text-civic">{message}</p>}

      <form onSubmit={createAuthority} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 font-semibold text-navy">Create authority</h2>
        {['name', 'email', 'password', 'phone', 'city'].map((field) => (
          <label key={field} className="text-sm font-medium capitalize">
            {field}
            <input
              required={['name', 'email', 'password'].includes(field)}
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
        ))}
        <label className="text-sm font-medium">
          Department
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          >
            {['roads', 'electricity', 'water', 'sanitation', 'general'].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Level
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          >
            <option value={1}>1 · local</option>
            <option value={2}>2 · district</option>
            <option value={3}>3 · higher</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Office lat
          <input
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium">
          Office lng
          <input
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium">
          Radius km
          <input
            type="number"
            value={form.radiusKm}
            onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <button type="submit" className="md:col-span-2 rounded-lg bg-navy py-2 font-semibold text-white">
          Create approved authority
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Approved</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="px-3 py-2">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted">{u.email}</div>
                </td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">
                  {u.role === 'authority' ? (
                    <select
                      value={u.department || 'general'}
                      onChange={(e) => patchUser(u.id, { department: e.target.value })}
                      className="rounded border border-black/10 px-1 py-1"
                    >
                      {['roads', 'electricity', 'water', 'sanitation', 'general'].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-2">
                  {u.role === 'authority' ? (
                    <select
                      value={u.level || 1}
                      onChange={(e) => patchUser(u.id, { level: Number(e.target.value) })}
                      className="rounded border border-black/10 px-1 py-1"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-2">{u.isApproved ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2">{u.civicScore}</td>
                <td className="px-3 py-2">
                  {u.role === 'authority' && (
                    <button
                      type="button"
                      onClick={() => patchUser(u.id, { isApproved: !u.isApproved })}
                      className="rounded bg-saffron px-2 py-1 text-xs font-semibold text-navy"
                    >
                      {u.isApproved ? 'Revoke' : 'Approve'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
