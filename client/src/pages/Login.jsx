import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.emailOrUsername, form.password);
      toast.success('Welcome back! 🍒');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: '2rem' }}>🍒</span>
          <h2 style={{ marginTop: 8 }}>Welcome back</h2>
          <p style={{ opacity: 0.75, fontSize: '0.9rem' }}>Log in to keep the conversation sweet.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder="Email or username"
            value={form.emailOrUsername}
            onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p style={{ color: 'var(--cherry)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <button className="btn btn-primary" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.88rem' }}>
          New here? <Link to="/register" style={{ fontWeight: 800, color: 'var(--cherry)' }}>Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
