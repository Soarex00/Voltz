import axios from 'axios';
import { getToken, clearSession } from './session';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 30000 });
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) clearSession();
  return Promise.reject(error);
});
export const errorMessage = error => error.response?.data?.message || 'Não foi possível conectar ao servidor. Tente novamente.';
