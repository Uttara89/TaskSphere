import axios from 'axios';

// Normalize and pick base URL
const normalize = (url) => (url ? url.replace(/\/$/, '') : url);
const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
