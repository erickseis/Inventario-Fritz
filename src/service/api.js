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
      return Promise.reject(error);
    }
  );
  
  // TOKEN EXPIRADO
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 403) {
        deleteToken();
        deleteTokenRefresh();
        localStorage.removeItem('user');
        localStorage.removeItem('department');
        // DIRIGIR AL LOGIN
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  export default api;