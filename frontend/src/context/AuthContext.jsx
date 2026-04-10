import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import axios, { API } from '../lib/api';
import { getStoredUser, storeUser, clearUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, showToast }) => {
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  const handleAuthSuccess = useCallback((userData, isNew = false) => {
    storeUser(userData);
    setUser(userData);
    if (isNew) showToast(`Welcome to the Court, ${userData.username}!`);
    navigate(userData.is_admin ? '/admin' : '/home');
  }, [navigate, showToast]);

  const handleLogout = useCallback(async () => {
    try { await axios.post(`${API}/users/logout/`); } catch (e) { console.error("Logout cleanup failed", e); }
    clearUser();
    setUser(null);
    navigate('/');
  }, [navigate]);

  const handleGuest = useCallback(() => {
    localStorage.removeItem('ic_guest_id');
    const guestUser = { username: 'Spectator', is_guest: true };
    setUser(guestUser);
    navigate('/home');
    showToast("Entering Spectator Mode. Voting Enabled (IP-Locked).");
  }, [navigate, showToast]);

  // Handle session timeout or CSRF errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && [401, 403].includes(error.response.status)) {
          showToast("Session expired or security error. Logging out.", "error");
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [handleLogout, showToast]);

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
