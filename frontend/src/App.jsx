import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider, useAuth } from './context/AuthContext';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './pages/admin/AdminDashboard';

/* ── Toast wrapper (lifted above AuthProvider so it can be passed down) ── */
const AppShell = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <AuthProvider showToast={showToast}>
      <div className="layout-container">
        <AnimatePresence mode="wait">
          <AppRoutes showToast={showToast} />
        </AnimatePresence>
        <Toast toast={toast} />
      </div>
    </AuthProvider>
  );
};

/* ── Route definitions ── */
const AppRoutes = ({ showToast }) => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to={user.is_admin ? '/admin' : '/home'} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.is_admin ? '/admin' : '/home'} replace /> : <LoginPage showToast={showToast} />} />
      <Route path="/register" element={user ? <Navigate to={user.is_admin ? '/admin' : '/home'} replace /> : <RegisterPage showToast={showToast} />} />

      {/* Authenticated routes */}
      <Route path="/home" element={!user ? <Navigate to="/" replace /> : <HomePage showToast={showToast} />} />
      <Route path="/history" element={user && !user.is_guest ? <HistoryPage showToast={showToast} /> : <Navigate to="/" replace />} />

      {/* Admin routes — non-admins see 404 */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard showToast={showToast} />
        </ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminDashboard showToast={showToast} />
        </ProtectedRoute>
      } />

      {/* 404 catch-all */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppShell;
