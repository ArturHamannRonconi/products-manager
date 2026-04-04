import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { userType, setAccessToken, clear } = useAuthStore.getState();
      const refreshEndpoint =
        userType === 'seller'
          ? '/seller/refresh-token'
          : '/customer/refresh-token';

      try {
        const { data } = await api.post(refreshEndpoint);
        setAccessToken(data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        clear();
        const loginPath =
          userType === 'seller' ? '/seller/login' : '/customer/login';
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  },
);
