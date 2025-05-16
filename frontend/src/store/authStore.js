// src/store/authStore.js
// --- Zustand Store for Authentication ---

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '../services/api'; // Import the configured Axios instance

// Define the store
export const useAuthStore = create(
  // Use persist middleware to save state to localStorage
  persist(
    (set, get) => ({
      // --- State ---
      accessToken: null,
      refreshToken: null,
      user: null, // To store basic user info (e.g., id, username) after login
      isAuthenticated: false,
      isLoading: true, // To track if initial auth check is happening

      // --- Actions ---

      // Action to set tokens and update authentication status
      setTokens: (access, refresh) => {
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: !!access, // True if access token exists
        });
        // Update Axios default header (useful if instance is used elsewhere directly)
        if (access) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        } else {
          delete apiClient.defaults.headers.common['Authorization'];
        }
        console.log('Tokens set. IsAuthenticated:', !!access);
      },

      // Action to set user info
      setUser: (userData) => {
        set({ user: userData });
        console.log('User set:', userData);
      },

      // Action for user login
      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.post('/auth/login/', credentials);
          // Adjust based on your actual backend response structure
          const access = response.data.access;
          const refresh = response.data.refresh;
          // Assume user info might be nested or needs a separate fetch
          const user = response.data.user || null;
          get().setTokens(access, refresh);
          get().setUser(user); // Set user info if provided
          set({ isLoading: false });
          console.log('Login successful');
          return true; // Indicate success
        } catch (error) {
          console.error('Login failed:', error.response?.data || error.message);
          get().logout(); // Ensure clean state on failed login
          set({ isLoading: false });
          throw error; // Re-throw error for component to handle
        }
      },

      // Action for user registration
      register: async (userData) => {
         try {
          set({ isLoading: true });
          // The register endpoint likely doesn't return tokens directly.
          // It might return the created user or just a success message.
          await apiClient.post('/auth/register/', userData);
          // Optionally: Log the user in automatically after registration
          // await get().login({ username: userData.username, password: userData.password });
          console.log('Registration successful. Please log in.');
           set({ isLoading: false });
          return true; // Indicate success
        } catch (error) {
          console.error('Registration failed:', error.response?.data || error.message);
           set({ isLoading: false });
          throw error; // Re-throw error for component to handle
        }
      },

      // Action for user logout
      logout: () => {
        console.log('Logging out...');
        get().setTokens(null, null); // Clear tokens
        get().setUser(null); // Clear user info
        // No need to clear localStorage manually here, persist middleware handles it when state changes.
        // Optionally: Redirect to login page
        // window.location.href = '/login';
      },

      // Action to initialize auth state from storage
      initializeAuth: () => {
        console.log('Initializing auth state...');
        // Persist middleware automatically rehydrates state on load.
        // We just need to update isAuthenticated based on rehydrated tokens.
        const { accessToken, refreshToken } = get(); // Get potentially rehydrated tokens
        if (accessToken && refreshToken) {
           // Verify token validity if possible (e.g., check expiry or make a test API call)
           // For simplicity here, we assume stored tokens are initially valid
           set({ isAuthenticated: true, isLoading: false });
           apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
           console.log('Auth initialized from storage. User is authenticated.');
           // Optional: Fetch user profile here if needed and not returned on login/refresh
           // get().fetchUserProfile();
        } else {
            set({ isLoading: false });
            console.log('Auth initialized. No valid tokens found.');
        }
      },

      // Optional: Action to fetch user profile if not included in login/refresh
      // fetchUserProfile: async () => {
      //   if (!get().isAuthenticated) return; // Don't fetch if not authenticated
      //   try {
      //     const response = await apiClient.get('/auth/user/'); // Example endpoint
      //     get().setUser(response.data);
      //   } catch (error) {
      //     console.error('Failed to fetch user profile:', error);
      //     // Handle error, maybe logout if profile fetch fails despite having tokens
      //     if (error.response?.status === 401) {
      //        get().logout();
      //     }
      //   }
      // },

    }),
    {
      name: 'auth-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({
        // Only persist tokens and user info
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      // This runs AFTER state is hydrated
      onRehydrateStorage: () => {
        console.log('Zustand state has been rehydrated from localStorage.');
        // Return a function to run post-rehydration logic
        return (state) => {
           // Initialize auth status based on rehydrated tokens
           // This is a good place to call initializeAuth or similar logic
           // state.initializeAuth(); // Call the action defined above
           // Or directly set state if initializeAuth isn't needed separately
           const { accessToken, refreshToken } = state;
            if (accessToken && refreshToken) {
               state.isAuthenticated = true;
               apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
               console.log('Auth status set post-rehydration.');
               // Consider fetching user profile here if needed
               // state.fetchUserProfile?.();
            } else {
               state.isAuthenticated = false;
            }
            state.isLoading = false; // Mark loading as complete
        }
      },
      // Set version number if you need to handle migrations
      // version: 1,
      // migrate: (persistedState, version) => {
      //   if (version === 0) {
      //     // Migration logic if needed
      //   }
      //   return persistedState;
      // },
    }
  )
);

// // Initializing auth state might be better handled in App.jsx useEffect
// // to ensure it runs after the store is fully ready and hydrated.
// // useAuthStore.getState().initializeAuth();
