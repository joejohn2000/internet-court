/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import axios, { API } from '../lib/api';
import { getStoredUser, storeUser, clearUser, ensureGuestIdentity } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, showToast }) => {
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  const handleAuthSuccess = useCallback((userData, isNew = false) => {
    storeUser(userData);
    setUser(userData);
    if (isNew) showToast(`Welcome to the Court, ${userData.username}!`);
    // Redirect admins to dashboard, regular users to History
    navigate(userData.is_admin ? '/admin' : '/home');
  }, [navigate, showToast]);

  const handleLogout = useCallback(async () => {
    try { await axios.post(`${API}/users/logout/`); } catch (e) { console.error("Logout cleanup failed", e); }
    clearUser();
    setUser(null);
    navigate('/');
  }, [navigate]);

  const handleGuest = useCallback(() => {
    const guestUser = { username: ensureGuestIdentity(), is_guest: true };
    storeUser(guestUser);
    setUser(guestUser);
    navigate('/home');
    showToast(`Temporary identity assigned: ${guestUser.username}.`);
  }, [navigate, showToast]);

  // Handle session timeout and auto-refresh
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config || {};
        const status = error.response?.status;

        if (status === 401 && user && !originalRequest._handled401) {
          originalRequest._handled401 = true;
          showToast("Session expired. Please log in again.", "error");
          handleLogout();
        }
        
        if (status && [403].includes(status)) {
           // For 403 (Forbidden), usually means admin only or specific access denied
           showToast("Access Denied: Restricted Zone.", "error");
        }

        if ((!status || status >= 500) && !originalRequest._handledServerError) {
          originalRequest._handledServerError = true;
          clearUser();
          setUser(null);
          showToast("Server error detected. Returning to landing page.", "error");
          navigate('/', { replace: true });
        }
        
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(responseInterceptor);
  }, [user, handleLogout, navigate, showToast]);

  return (
    <AuthContext.Provider value={{ user, setUser, handleAuthSuccess, handleLogout, handleGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
