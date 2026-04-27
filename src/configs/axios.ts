import axios from 'axios';

// Create axios instance with base configuration
const apiService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  // baseURL: "",
  timeout: 300000,
  withCredentials: true, // This ensures cookies are sent with requests
});

// Request interceptor - simple configuration
apiService.interceptors.request.use(
  (config) => {
    // Set Content-Type if not already set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - centralized error handling
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const backendMessage: string | undefined = error.response?.data?.message

    if (error.response) {
      const status: number = error.response.status

      if (status === 401) {
        error.message = backendMessage || 'Your session has expired. Please log in again.'
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      } else if (status === 403) {
        error.message = backendMessage || 'You do not have permission to perform this action.'
      } else if (status === 404) {
        error.message = backendMessage || 'The requested resource was not found.'
      } else if (status === 422 || status === 400) {
        error.message = backendMessage || 'Invalid request. Please check your input.'
      } else if (status >= 500) {
        error.message = backendMessage || 'A server error occurred. Please try again later.'
      } else if (backendMessage) {
        error.message = backendMessage
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Request timed out. Please try again.'
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection and try again.'
    }

    return Promise.reject(error)
  }
);

export default apiService;