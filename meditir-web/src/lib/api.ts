import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor — attach token + hospital slug
  instance.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Attach hospital slug from localStorage (set after login)
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('hospitalSlug');
      if (slug) config.headers['X-Hospital-Slug'] = slug;
    }
    return config;
  });

  // Response interceptor — auto-refresh on 401
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as typeof error.config & { _retry?: boolean };
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const res = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const newToken = res.data.data.accessToken;
          setAccessToken(newToken);
          if (original.headers) {
            original.headers.Authorization = `Bearer ${newToken}`;
          }
          return instance(original);
        } catch {
          setAccessToken(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiClient();
