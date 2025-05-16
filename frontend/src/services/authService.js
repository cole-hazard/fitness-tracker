// src/services/authService.js
// --- Service functions for Authentication API calls ---

import apiClient from './api'; // Use the configured Axios instance
import { useAuthStore } from '../store/authStore'; // Access Zustand actions if needed

// Login function
export const loginUser = async (credentials) => {
  // We delegate the actual API call and state update to the Zustand action
  // This keeps the service layer focused on *defining* the API interaction,
  // while the store manages the *state changes* resulting from it.
  return useAuthStore.getState().login(credentials);
};

// Registration function
export const registerUser = async (userData) => {
  // Delegate to Zustand action
  return useAuthStore.getState().register(userData);
};

// Logout function (can be called directly from components)
export const logoutUser = () => {
  // Delegate to Zustand action
  useAuthStore.getState().logout();
};

// Example of another auth-related call if needed (e.g., fetch profile)
// export const fetchUserProfile = async () => {
//   return useAuthStore.getState().fetchUserProfile();
// };

// Note: Refresh is handled by the interceptor in api.js,
// so we don't typically need an explicit refresh function here for components to call.