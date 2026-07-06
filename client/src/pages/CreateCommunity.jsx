import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { communityApi } from '../api/endpoints.js';

const THEME_COLORS = ['#D73A49', '#6F1D2A', '#EAA6C8', '#F7D6E6'];

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', displayName: '', description: '', themeColor: THEME_COLORS[0] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[a-z0-9_]{3,21}$/.test(form.name)) {
      setError('Community name must be 3-21 lowercase letters, numbers, or underscores.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await communityApi.create(form);
      toast.success(`c/${data.community.name} created! 🍬`);
      navigate(`/c/${data.community.name}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create community.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 28 }}>
        <h2>Start a community</h2>
        <p style={{ opacity: 0.75, fontSize: '0.9rem', marginTop: 4 }}>Give your corner of the orchard a name.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              c/ name (permanent, lowercase)
            </label>
            <input
              placeholder="e.g. sourdoughclub"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase() })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Display name</label>
            <input
              placeholder="e.g. Sourdough Club"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Description</label>
            <textarea
              placeholder="What's this community about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Theme color</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {THEME_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setForm({ ...form, themeColor: color })}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: color,
                    border: form.themeColor === color ? '3px solid var(--ink)' : '3px solid transparent',
                  }}
                  aria-label={`Choose ${color}`}
                />
              ))}
            </div>
          </div>

          {error && <p style={{ color: 'var(--cherry)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create community'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCommunity;
