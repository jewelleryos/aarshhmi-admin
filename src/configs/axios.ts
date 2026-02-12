import axios from 'axios';

// Create axios instance with base configuration
const apiService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  timeout: 30000,
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

// Response interceptor - simple for now
apiService.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response;
  },
  (error) => {
    // We'll handle errors in the components/services for now
    // Later we can add centralized error handling here
    return Promise.reject(error);
  }
);

export default apiService;