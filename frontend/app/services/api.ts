import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Attach JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Get token from aegisops_user session
    const sessionRaw = localStorage.getItem('aegisops_user');
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        if (session.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear session and redirect to login
      localStorage.removeItem('aegisops_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
