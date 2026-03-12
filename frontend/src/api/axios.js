import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://fittrack-pro-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fittrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fittrack_token');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
