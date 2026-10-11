import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminPortal from './admin/AdminPortal.jsx';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <AdminPortal />
    </React.StrictMode>
  );
}
