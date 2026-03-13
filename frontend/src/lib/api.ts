import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request para agregar token JWT
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sapid_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response para manejar errores
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Manejar error 401 (token expirado o inválido)
    if (error.response?.status === 401) {
      // Limpiar token y redirigir a login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sapid_token');
        localStorage.removeItem('sapid_user');
        window.location.href = '/login';
      }
    }

    // Manejar error de red (offline)
    if (!error.response && error.message === 'Network Error') {
      console.warn('Network error detected - app is offline');
    }

    return Promise.reject(error);
  }
);

/**
 * Detecta si hay conectividad
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return navigator.onLine;
}

/**
 * Espera a que haya conectividad
 */
export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
}

export default api;
