import axios from 'axios';

const DEFAULT_API = 'https://internet-court.onrender.com/api';

export const API = import.meta.env.VITE_API_BASE || DEFAULT_API;

const loadingListeners = {
  start: () => {},
  end: () => {},
};

export const setAxiosLoadingListeners = ({ start, end }) => {
  loadingListeners.start = typeof start === 'function' ? start : () => {};
  loadingListeners.end = typeof end === 'function' ? end : () => {};
};

// Attach the short-lived access token to authenticated requests.
axios.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(localStorage.getItem('ic_user') || 'null');
    if (u?.access) config.headers['Authorization'] = `Bearer ${u.access}`;
  } catch { /* ignore */ }

  if (!config.skipGlobalLoader) {
    config.__globalLoaderTracked = true;
    loadingListeners.start();
  }

  return config;
}, (error) => {
  loadingListeners.end();
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  if (response.config?.__globalLoaderTracked) {
    loadingListeners.end();
  }

  return response;
}, (error) => {
  if (error.config?.__globalLoaderTracked) {
    loadingListeners.end();
  }

  return Promise.reject(error);
});

export default axios;
