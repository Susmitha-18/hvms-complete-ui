import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
// Import runtime API shims and axios defaults early so any module that
// uses axios or fetch will pick up the correct API base (runtime or build-time).
// This ensures pages that call `axios.get('/api/...')` work in production
// where the backend is on a different origin (we rely on
// `window.__HVMS_API_URL` set in `index.html`).
import './services/api';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
