import axios from 'axios';
import logout from 'functions/logout';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL || '/api',
});

axiosInstance.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = token;
    }
    const fiscalYearId = Cookies.get('fiscalYearId');
    if (fiscalYearId) {
      config.headers['x-fiscal-year-id'] = fiscalYearId;
    }
  }
  return config;
});

let isLoggingOut = false;

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const { response } = error;

    // 423 Locked: backend is in licence read-only mode and rejected a write.
    if (response?.status === 423 && typeof window !== 'undefined') {
      const msg =
        response.data?.message ||
        'The system is currently read-only. Changes cannot be saved.';
      alert(msg);
      return Promise.reject(error);
    }

    if (response?.status === 401 && typeof window !== 'undefined') {
      const data = response.data || {};
      const sessionInvalidMessages = [
        'User logged in elsewhere',
        'Token expired',
        'Invalid token',
        'Invalid or expired token',
      ];

      if (sessionInvalidMessages.includes(data.message) && !isLoggingOut) {
        isLoggingOut = true;
        alert('Your session has expired or you have logged in from another device. You will be redirected to the login page.');
        await logout();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;