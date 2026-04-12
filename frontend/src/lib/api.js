import axios from 'axios';

export const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
axios.defaults.withCredentials = true;

// Attach user identity/token to every request
axios.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(localStorage.getItem('ic_user') || 'null');
    if (u?.id) config.headers['X-User-Id'] = u.id;
    if (u?.access) config.headers['Authorization'] = `Bearer ${u.access}`;
  } catch { /* ignore */ }
  return config;
});

export default axios;
