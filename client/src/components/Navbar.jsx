import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationApi, searchApi } from '../api/endpoints.js';
import { timeAgo } from '../utils/format.js';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = () => {
      notificationApi
        .list({ limit: 8 })
        .then(({ data }) => {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(null);
      return;
    }
    const timeout = setTimeout(() => {
      searchApi.global(query).then(({ data }) => setSuggestions(data)).catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSuggestions(null);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const openNotifications = async () => {
    setNotifOpen((o) => !o);
    if (!notifOpen && unreadCount > 0) {
      await notificationApi.markAllRead();
      setUnreadCount(0);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(249, 245, 239, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 18, height: 66 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: '1.5rem' }}>🍒</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--burgundy)' }}>
            CherryReddit
          </span>
        </Link>

        <div ref={searchRef} style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
          <form onSubmit={submitSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search CherryReddit"
              style={{ width: '100%', borderRadius: 999, background: '#fff' }}
              aria-label="Search"
            />
          </form>
          <AnimatePresence>
            {suggestions && (suggestions.posts?.length > 0 || suggestions.communities?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="card"
                style={{ position: 'absolute', top: '110%', left: 0, right: 0, padding: 10, zIndex: 60, maxHeight: 360, overflowY: 'auto' }}
              >
                {suggestions.communities?.slice(0, 3).map((c) => (
                  <Link
                    key={c._id}
                    to={`/c/${c.name}`}
                    onClick={() => setSuggestions(null)}
                    style={{ display: 'block', padding: '8px 10px', borderRadius: 10, fontWeight: 700 }}
                  >
                    c/{c.name}
                  </Link>
                ))}
                {suggestions.posts?.slice(0, 5).map((p) => (
                  <Link
                    key={p._id}
                    to={`/post/${p._id}`}
                    onClick={() => setSuggestions(null)}
                    style={{ display: 'block', padding: '8px 10px', borderRadius: 10, fontSize: '0.88rem' }}
                  >
                    {p.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {user && (
            <Link to="/create-post" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
              + Create
            </Link>
          )}

          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={openNotifications}
                aria-label="Notifications"
                style={{
                  background: 'var(--pink)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 38,
                  height: 38,
                  position: 'relative',
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      background: 'var(--cherry)',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '0.62rem',
                      width: 17,
                      height: 17,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="card"
                    style={{ position: 'absolute', right: 0, top: '120%', width: 320, maxHeight: 400, overflowY: 'auto', padding: 8, zIndex: 60 }}
                  >
                    {notifications.length === 0 && (
                      <p style={{ padding: 16, textAlign: 'center', opacity: 0.7 }}>No notifications yet 🍬</p>
                    )}
                    {notifications.map((n) => (
                      <Link
                        key={n._id}
                        to={n.post ? `/post/${n.post._id || n.post}` : '#'}
                        onClick={() => setNotifOpen(false)}
                        style={{
                          display: 'block',
                          padding: 10,
                          borderRadius: 12,
                          fontSize: '0.85rem',
                          background: n.isRead ? 'transparent' : 'var(--pink)',
                          marginBottom: 4,
                        }}
                      >
                        <p style={{ margin: 0 }}>{n.message}</p>
                        <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>{timeAgo(n.createdAt)}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen((m) => !m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--pink)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '6px 12px 6px 6px',
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: user.avatar?.url ? `url(${user.avatar.url}) center/cover` : 'var(--rose)',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{user.username}</span>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="card"
                    style={{ position: 'absolute', right: 0, top: '120%', width: 200, padding: 8, zIndex: 60 }}
                  >
                    <Link to={`/u/${user.username}`} onClick={() => setMenuOpen(false)} style={menuItemStyle}>
                      My profile
                    </Link>
                    <Link to="/saved" onClick={() => setMenuOpen(false)} style={menuItemStyle}>
                      Saved posts
                    </Link>
                    <Link to="/create-community" onClick={() => setMenuOpen(false)} style={menuItemStyle}>
                      Create a community
                    </Link>
                    {(user.role === 'admin' || user.role === 'moderator') && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} style={menuItemStyle}>
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        navigate('/');
                      }}
                      style={{ ...menuItemStyle, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const menuItemStyle = {
  display: 'block',
  padding: '9px 10px',
  borderRadius: 10,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--ink)',
};

export default Navbar;
