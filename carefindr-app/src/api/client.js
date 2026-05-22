import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000,
});

// Set or clear the auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

export const sendMessage = (sessionId, message) =>
  client.post('/chat', { session_id: sessionId || null, message });

export const register = (name, email, password) =>
  client.post('/auth/register', { name, email, password });

export const loginApi = (email, password) =>
  client.post('/auth/login', { email, password });

export const getUserSessions = () =>
  client.get('/user/sessions');

export const getSessionHistory = (sessionId) =>
  client.get(`/chat/${sessionId}/history`);

export default client;
