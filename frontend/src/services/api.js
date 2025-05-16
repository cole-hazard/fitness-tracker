// src/services/api.js
// --- Axios Instance & Interceptors ---

import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Import Zustand store

// Create the Axios instance
const apiClient = axios.create({
  baseURL: '/api/', // Using Vite proxy
  timeout: 10000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// Adds the Authorization header to requests if a token exists
apiClient.interceptors.request.use(
  (config) => {
    // Get token from Zustand *inside* the interceptor function
    // This ensures the latest token is used for each request
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Handle request error here
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// Handles 401 errors, attempts token refresh, and retries the original request
let isRefreshing = false; // Flag to prevent multiple refresh attempts
let failedQueue = []; // Queue to hold failed requests during refresh

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // If request is successful, just return the response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Get refresh token and actions *inside* the interceptor function
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    // Check if it's a 401 error, not for login/refresh endpoints, and we have a refresh token
    if (error.response?.status === 401 &&
        !originalRequest._retry && // Prevent infinite loops
        refreshToken &&
        originalRequest.url && // Ensure url exists
        !originalRequest.url.includes('/auth/login') &&
        !originalRequest.url.includes('/auth/login/refresh'))
     {

      if (isRefreshing) {
        // If already refreshing, add the request to the queue
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest); // Retry with new token
        }).catch(err => {
          return Promise.reject(err); // Propagate error if queue processing fails
        });
      }

      originalRequest._retry = true; // Mark that we've tried to refresh for this request
      isRefreshing = true;

      try {
        console.log('Attempting to refresh token...');
        // Use a temporary Axios instance or direct fetch for refresh to avoid interceptor loop
        const refreshResponse = await axios.post('/api/auth/login/refresh/', {
          refresh: refreshToken,
        }, {
           baseURL: '/api/' // Ensure base URL is set if not using the intercepted instance
        });


        const newAccessToken = refreshResponse.data.access;
        // Note: Your refresh endpoint might return a new refresh token as well.
        // If so, you should update it in the store. Assuming here it only returns access.
        const newRefreshToken = refreshToken; // Or refreshResponse.data.refresh if applicable

        console.log('Token refreshed successfully.');
        // Call the action from the store instance
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        // Update the Authorization header for the original request
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken); // Process queued requests with the new token
        return apiClient(originalRequest); // Retry the original request

      } catch (refreshError) {
        console.error('Unable to refresh token:', refreshError);
        processQueue(refreshError, null); // Reject queued requests
        useAuthStore.getState().logout(); // Logout the user if refresh fails
        // Optionally redirect to login page
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Reset refreshing flag
      }
    }

    // For errors other than 401 or if refresh fails/not possible
    console.error('API call error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient; // Export the configured instance