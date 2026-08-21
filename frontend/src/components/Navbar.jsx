import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-navy text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-wide">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-saffron text-navy">
            ज
          </span>
          JanSetu
        </NavLink>

        {user ? (
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              Nearby
            </NavLink>
            {user.role === 'civilian' && (
              <NavLink to="/report" className={linkClass}>
                Report
              </NavLink>
            )}
            {(user.role === 'authority' || user.role === 'admin') && (
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
            )}
            {user.role === 'admin' && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <button
              type="button"
              onClick={onLogout}
              className="ml-2 rounded-md bg-saffron px-3 py-2 text-sm font-semibold text-navy hover:bg-saffron-600"
            >
              Logout
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-1">
            <NavLink to="/login" className={linkClass}>
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-md bg-saffron px-3 py-2 text-sm font-semibold text-navy"
            >
              Register
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
