import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/global.css';

// HashRouter (not BrowserRouter) is used here because GitHub Pages serves static
// files with no server-side rewrite support — HashRouter keeps all routing
// client-side (URLs look like /#/post/123) so deep links and refreshes never 404.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);