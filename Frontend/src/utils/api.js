import axios from 'axios';

// Normalize and pick base URL
const normalize = (url) => (url ? url.replace(/\/$/, '') : url);
const baseURL = normalize(import.meta.env.VITE_API_BASE_URL) || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  // withCredentials: true, // uncomment if your backend sets cookies / auth that needs credentials
});

export default api;
