import { io } from 'socket.io-client';

const normalize = (url) => (url ? url.replace(/\/$/, '') : url);
const socketURL = normalize(import.meta.env.VITE_SOCKET_BASE_URL) || normalize(import.meta.env.VITE_API_BASE_URL) || 'http://localhost:3000';

export const createSocket = (opts = {}) => io(socketURL, opts);
