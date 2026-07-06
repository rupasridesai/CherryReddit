import api from './axios.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const postApi = {
  feed: (params) => api.get('/posts', { params }),
  get: (id) => api.get(`/posts/${id}`),
  create: (formData) =>
    api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  vote: (id, direction) => api.post(`/posts/${id}/vote`, { direction }),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),
  moderate: (id, action, reason) => api.patch(`/posts/${id}/moderate`, { action, reason }),
  search: (q) => api.get('/posts/search', { params: { q } }),
};

export const commentApi = {
  forPost: (postId, sort) => api.get(`/comments/post/${postId}`, { params: { sort } }),
  create: (data) => api.post('/comments', data),
  vote: (id, direction) => api.post(`/comments/${id}/vote`, { direction }),
  update: (id, body) => api.patch(`/comments/${id}`, { body }),
  remove: (id) => api.delete(`/comments/${id}`),
  moderate: (id, action) => api.patch(`/comments/${id}/moderate`, { action }),
};

export const communityApi = {
  list: (params) => api.get('/communities', { params }),
  trending: () => api.get('/communities/trending'),
  get: (name) => api.get(`/communities/${name}`),
  create: (data) => api.post('/communities', data),
  update: (name, formData) => api.patch(`/communities/${name}`, formData),
  join: (name) => api.post(`/communities/${name}/join`),
  addModerator: (name, username) => api.post(`/communities/${name}/moderators`, { username }),
};

export const userApi = {
  profile: (username) => api.get(`/users/${username}`),
  comments: (username) => api.get(`/users/${username}/comments`),
  updateMe: (formData) =>
    api.patch('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  saved: () => api.get('/users/saved'),
  toggleSave: (postId) => api.post(`/users/saved/${postId}`),
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const searchApi = {
  global: (q) => api.get('/search', { params: { q } }),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  ban: (id, reason) => api.patch(`/admin/users/${id}/ban`, { reason }),
  unban: (id) => api.patch(`/admin/users/${id}/unban`),
  reports: (status) => api.get('/admin/reports', { params: { status } }),
  resolveReport: (id, status) => api.patch(`/admin/reports/${id}`, { status }),
  report: (data) => api.post('/admin/reports', data),
};
