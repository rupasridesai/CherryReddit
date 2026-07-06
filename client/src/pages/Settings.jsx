import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { userApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';

const Settings = () => {
  const { user, updateLocalUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('bio', bio);
      if (avatar) fd.append('avatar', avatar);
      if (banner) fd.append('banner', banner);
      const { data } = await userApi.updateMe(fd);
      updateLocalUser(data.user);
      toast.success('Profile updated! 🍒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 28 }}>
        <h2>Edit profile</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={300} style={{ width: '100%', resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Banner</label>
            <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} />
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;
