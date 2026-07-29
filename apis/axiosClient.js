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