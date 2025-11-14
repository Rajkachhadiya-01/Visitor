// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

// import { AuthProvider } from './context/AuthContext';
import { AuthProvider } from "./context/AuthContext";

import VisitorApp from './VisitorApp';   // ✅ Use your VisitorApp.jsx

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <VisitorApp />
    </AuthProvider>
  </React.StrictMode>
);

// Optional: performance analytics
reportWebVitals();
