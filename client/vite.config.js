import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project sites are served at username.github.io/<repo-name>/,
  // so assets need that subpath baked in. Set VITE_BASE_PATH="/cherryreddit/"
  // (your actual repo name, with slashes) only when building for GitHub Pages;
  // it defaults to "/" for local dev, Vercel, Netlify, etc.
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});