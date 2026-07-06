import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Welcome to CherryReddit! 🍒');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: '2rem' }}>🍬</span>
          <h2 style={{ marginTop: 8 }}>Join the orchard</h2>
          <p style={{ opacity: 0.75, fontSize: '0.9rem' }}>Create an account to post, vote, and build karma.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            minLength={3}
            maxLength={20}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={8}
            required
          />
          {error && <p style={{ color: 'var(--cherry)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <button className="btn btn-primary" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.88rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 800, color: 'var(--cherry)' }}>Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
