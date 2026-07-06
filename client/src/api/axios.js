import axios from 'axios';

// In local dev, Vite proxies "/api" to the backend (see vite.config.js).
// In production with the frontend and backend on separate domains (e.g. Vercel + Render),
// set VITE_API_URL to the deployed API's full URL, e.g. https://cherryreddit-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cherry_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cherry_token');
      localStorage.removeItem('cherry_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
