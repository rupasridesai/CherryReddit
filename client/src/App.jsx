import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import PostDetail from './pages/PostDetail.jsx';
import CreatePost from './pages/CreatePost.jsx';
import CreateCommunity from './pages/CreateCommunity.jsx';
import Profile from './pages/Profile.jsx';
import SavedPosts from './pages/SavedPosts.jsx';
import Search from './pages/Search.jsx';
import Settings from './pages/Settings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ModeratePosts from './pages/ModeratePosts.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fffdfa',
            color: '#43332F',
            border: '1px solid rgba(67,51,47,0.14)',
            borderRadius: '14px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
          },
          success: { iconTheme: { primary: '#D73A49', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/c/:name" element={<CommunityPage />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-community"
            element={
              <ProtectedRoute>
                <CreateCommunity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/c/:name/moderate"
            element={
              <ProtectedRoute requireRole={['admin', 'moderator']}>
                <ModeratePosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole={['admin', 'moderator']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Layout hideSidebar />}>
          <Route index element={<Login />} />
        </Route>
        <Route path="/register" element={<Layout hideSidebar />}>
          <Route index element={<Register />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
