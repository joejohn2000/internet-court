import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalLoader from './components/GlobalLoader';

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
    <LoadingProvider>
      <AuthProvider showToast={showToast}>
        <div className="app-shell">
          <GlobalLoader />
          <AppRoutes showToast={showToast} />
          <Toast toast={toast} />
        </div>
      </AuthProvider>
    </LoadingProvider>
  );
};

/* ── Route definitions ── */
const AppRoutes = ({ showToast }) => {
  const MotionDiv = motion.div;
  const { user } = useAuth();
  const hasPermanentSession = Boolean(user && !user.is_guest);
  const { beginRouteTransition } = useLoading();
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;

  React.useEffect(() => beginRouteTransition(), [beginRouteTransition, routeKey]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionDiv
        key={routeKey}
        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen"
      >
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to={user.is_admin ? '/admin' : '/home'} replace /> : <LandingPage />} />
          <Route path="/login" element={hasPermanentSession ? <Navigate to={user.is_admin ? '/admin' : '/home'} replace /> : <LoginPage showToast={showToast} />} />
          <Route path="/register" element={hasPermanentSession ? <Navigate to={user.is_admin ? '/admin' : '/home'} replace /> : <RegisterPage showToast={showToast} />} />

          {/* Authenticated routes */}
          <Route path="/home" element={!user ? <Navigate to="/" replace /> : <HomePage showToast={showToast} />} />
          <Route path="/history" element={user && !user.is_guest ? <HistoryPage showToast={showToast} /> : <Navigate to="/" replace />} />

          {/* Admin routes — non-admins see 404 */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminDashboard showToast={showToast} />
            </ProtectedRoute>
          } />

          {/* 404 catch-all */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default AppShell;
