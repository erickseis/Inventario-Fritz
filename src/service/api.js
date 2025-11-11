import axios from 'axios'
import { getToken, deleteToken, deleteTokenRefresh } from './authSesion';


const api = axios.create({
    baseURL: 'https://fritz-api-rest.fritzvzla.com/api/v1',
    // baseURL: 'http://localhost:3000/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
    }
})

// AGREGAR TOKEN
api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      // Sanitize error before rejecting to avoid token exposure
      const sanitizedError = {
        ...error,
        config: {
          ...error.config,
          headers: {
            ...error.config?.headers,
            Authorization: '[REDACTED]'
          }
        }
      };
      console.error('Request error:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url
      });
      return Promise.reject(sanitizedError);
    }
  );
  
  // TOKEN EXPIRADO
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Sanitize error to prevent token exposure
      const sanitizedError = {
        ...error,
        config: {
          ...error.config,
          headers: {
            ...error.config?.headers,
            Authorization: '[REDACTED]'
          }
        }
      };

      // Log error without sensitive information
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });

      if (error.response && error.response.status === 403) {
        deleteToken();
        deleteTokenRefresh();
        localStorage.removeItem('user');
        localStorage.removeItem('department');
        // DIRIGIR AL LOGIN
        window.location.href = '/login';
      }
      return Promise.reject(sanitizedError);
    }
  );

  export default api;