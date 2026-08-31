import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: `${baseURL}/api` });

const TOKEN_KEY = 'afsa.token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error?.message || err.message || 'Request failed';
    if (err.response?.status === 401) {
      setToken(null);
      if (!location.pathname.startsWith('/login')) location.assign('/login');
    } else {
      toast.error(message);
    }
    return Promise.reject(err);
  }
);

export default api;
