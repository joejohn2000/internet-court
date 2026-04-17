import axios from 'axios';

const DEFAULT_API = 'https://internet-court.onrender.com/api';

export const API = import.meta.env.VITE_API_BASE || DEFAULT_API;
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
