import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Dashboard from './pages/authority/Dashboard';
import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center text-muted">Loading...</p>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnly>
                  <Register />
                </GuestOnly>
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Feed />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<ProtectedRoute roles={['civilian']} />}>
              <Route path="/report" element={<CreatePost />} />
            </Route>

            <Route element={<ProtectedRoute roles={['authority', 'admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/posts" element={<AdminPosts />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
