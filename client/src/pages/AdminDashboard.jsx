import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { adminApi } from '../api/endpoints.js';
import Loader from '../components/Loader.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const StatCard = ({ label, value, emoji }) => (
  <div className="card" style={{ padding: 18, flex: 1, minWidth: 140 }}>
    <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--burgundy)', margin: '6px 0 0' }}>{value}</p>
    <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.7 }}>{label}</p>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('reports');
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const calls = [adminApi.reports('pending')];
      if (isAdmin) {
        calls.push(adminApi.stats(), adminApi.users({ limit: 25 }));
      }
      const results = await Promise.all(calls);
      setReports(results[0].data.reports);
      if (isAdmin) {
        setStats(results[1].data.stats);
        setUsers(results[2].data.users);
      }
    } catch (err) {
      toast.error('Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveReport = async (id, status) => {
    try {
      await adminApi.resolveReport(id, status);
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast.success(status === 'actioned' ? 'Report actioned.' : 'Report dismissed.');
    } catch (err) {
      toast.error('Could not resolve report.');
    }
  };

  const handleBan = async (id) => {
    const reason = prompt('Ban reason:', 'Violation of site rules');
    if (reason === null) return;
    try {
      await adminApi.ban(id, reason);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBanned: true, banReason: reason } : u)));
      toast.success('User banned.');
    } catch (err) {
      toast.error('Could not ban user.');
    }
  };

  const handleUnban = async (id) => {
    try {
      await adminApi.unban(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBanned: false } : u)));
      toast.success('User unbanned.');
    } catch (err) {
      toast.error('Could not unban user.');
    }
  };

  const handleRole = async (id, role) => {
    try {
      await adminApi.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success(`Role updated to ${role}.`);
    } catch (err) {
      toast.error('Could not update role.');
    }
  };

  if (loading) return <Loader label="Loading dashboard…" />;

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>🛡️ Moderation & Admin</h1>
      <p style={{ opacity: 0.75, marginBottom: 20 }}>Keep the orchard tidy and the community sweet.</p>

      {isAdmin && stats && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard label="Total users" value={stats.userCount} emoji="🧑‍🤝‍🧑" />
          <StatCard label="Total posts" value={stats.postCount} emoji="📝" />
          <StatCard label="Total comments" value={stats.commentCount} emoji="💬" />
          <StatCard label="Communities" value={stats.communityCount} emoji="🍬" />
          <StatCard label="Pending reports" value={stats.pendingReports} emoji="🚩" />
          <StatCard label="New users (7d)" value={stats.newUsersThisWeek} emoji="✨" />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button onClick={() => setTab('reports')} className={tab === 'reports' ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: '0.82rem' }}>
          Reports queue
        </button>
        {isAdmin && (
          <button onClick={() => setTab('users')} className={tab === 'users' ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: '0.82rem' }}>
            Users
          </button>
        )}
      </div>

      {tab === 'reports' && (
        <div className="card" style={{ padding: 18 }}>
          {reports.length === 0 ? (
            <p style={{ opacity: 0.7, textAlign: 'center', padding: 20 }}>No pending reports. Nicely tidy! 🍃</p>
          ) : (
            reports.map((r, i) => (
              <div key={r._id}>
                <div style={{ padding: '12px 4px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>{r.targetType.toUpperCase()}</strong> reported by u/{r.reporter?.username} · reason: <em>{r.reason}</em>
                  </p>
                  {r.post && <p style={{ margin: '4px 0', fontWeight: 700 }}>{r.post.title}</p>}
                  {r.comment && <p style={{ margin: '4px 0', opacity: 0.85 }}>{r.comment.body}</p>}
                  {r.details && <p style={{ margin: '4px 0', opacity: 0.7, fontSize: '0.82rem' }}>Details: {r.details}</p>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.76rem' }} onClick={() => resolveReport(r._id, 'actioned')}>
                      Take action
                    </button>
                    <button className="btn btn-outline" style={{ fontSize: '0.76rem' }} onClick={() => resolveReport(r._id, 'dismissed')}>
                      Dismiss
                    </button>
                  </div>
                </div>
                {i < reports.length - 1 && <ScallopDivider style={{ margin: '4px 0' }} />}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'users' && isAdmin && (
        <div className="card" style={{ padding: 18, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: 8 }}>Username</th>
                <th style={{ padding: 8 }}>Role</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: 8, fontWeight: 700 }}>u/{u.username}</td>
                  <td style={{ padding: 8 }}>
                    <select value={u.role} onChange={(e) => handleRole(u._id, e.target.value)} style={{ padding: '4px 8px' }}>
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding: 8 }}>{u.isBanned ? '🚫 Banned' : '✅ Active'}</td>
                  <td style={{ padding: 8 }}>
                    {u.isBanned ? (
                      <button className="btn btn-outline" style={{ fontSize: '0.74rem' }} onClick={() => handleUnban(u._id)}>
                        Unban
                      </button>
                    ) : (
                      <button className="btn btn-outline" style={{ fontSize: '0.74rem' }} onClick={() => handleBan(u._id)}>
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
