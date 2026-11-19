import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Interceptor para anexar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para extrair automaticamente response.data.data (TransformInterceptor do NestJS)
// e tratar expiração/revogação de sessão (HTTP 401)
api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const isAuthLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isAuthLogin) {
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('USER');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
