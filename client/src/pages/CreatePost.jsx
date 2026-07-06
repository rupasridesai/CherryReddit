import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { postApi, communityApi } from '../api/endpoints.js';

const TYPES = [
  { key: 'text', label: '📝 Text' },
  { key: 'image', label: '🖼️ Image' },
  { key: 'link', label: '🔗 Link' },
];

const CreatePost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [communities, setCommunities] = useState([]);
  const [type, setType] = useState('text');
  const [form, setForm] = useState({
    title: '',
    body: '',
    linkUrl: '',
    communityName: searchParams.get('community') || '',
    flair: '',
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    communityApi.list({ limit: 50 }).then(({ data }) => setCommunities(data.communities)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.communityName) {
      setError('Title and community are required.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('body', form.body);
      fd.append('type', type);
      fd.append('communityName', form.communityName);
      fd.append('flair', form.flair);
      if (type === 'link') fd.append('linkUrl', form.linkUrl);
      if (type === 'image') images.forEach((img) => fd.append('images', img));

      const { data } = await postApi.create(fd);
      toast.success('Post published! 🍒');
      navigate(`/post/${data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 28 }}>
        <h2>Create a post</h2>
        <p style={{ opacity: 0.75, fontSize: '0.9rem', marginTop: 4 }}>Share something sweet with a community.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          <select
            value={form.communityName}
            onChange={(e) => setForm({ ...form, communityName: e.target.value })}
            required
          >
            <option value="">Choose a community…</option>
            {communities.map((c) => (
              <option key={c._id} value={c.name}>
                c/{c.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 8 }}>
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.key}
                onClick={() => setType(t.key)}
                className={type === t.key ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ fontSize: '0.82rem' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={300}
            required
          />

          <input
            placeholder="Flair (optional, e.g. Discussion)"
            value={form.flair}
            onChange={(e) => setForm({ ...form, flair: e.target.value })}
            maxLength={30}
          />

          {type === 'link' && (
            <input
              placeholder="https://example.com"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            />
          )}

          {type === 'image' && (
            <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} />
          )}

          <textarea
            placeholder="Body text (optional)"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={6}
            style={{ resize: 'vertical' }}
          />

          {error && <p style={{ color: 'var(--cherry)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish post'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePost;
