// src/App.jsx (or your main application component)
// --- Initialize Auth State on App Load ---

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
//import HomePage from './pages/HomePage';  Placeholder - Create this page
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// Import other pages and ProtectedRoute component later
// import WorkoutPlansPage from './pages/WorkoutPlansPage'; // Example
// import ProtectedRoute from './components/ProtectedRoute'; // Example

// Placeholder for HomePage
const TempHomePage = () => {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);
    return (
        <div className="p-4">
            {/* Added some more Shadcn-like utility classes for demonstration */}
            <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome {user?.username || 'User'}!</h1>
            <p className="text-muted-foreground mb-4">This is the protected home page.</p>
            <button // Consider using Shadcn Button component here later for consistency
                onClick={logout}
                className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
                Logout
            </button>
        </div>
    );
};


function App() {
  // Zustand's persist middleware handles rehydration automatically.
  // We just need to read the state to determine loading/auth status.
  const isLoadingAuth = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // The isLoading state is managed by the onRehydrateStorage callback in the store now.
  // useEffect(() => {
  //   // Initialize auth state when the app component mounts - Now handled by persist middleware
  //   // initializeAuth();
  // }, [initializeAuth]);

  // Show a loading indicator ONLY while Zustand is rehydrating state
  if (isLoadingAuth) {
    return (
        <div className="flex justify-center items-center min-h-screen font-inter">
            <div className="text-lg text-gray-600">Loading Application...</div> {/* Replace with a proper spinner */}
        </div>
    );
  }

  // App is ready, render routes
  return (
    <Router>
      {/* --- MODIFIED SECTION START --- */}
      {/* This div is the root for Shadcn UI theming. */}
      {/* It applies global styles like background color, font, and font smoothing. */}
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        {/* A global Layout component could go here (e.g., Navbar, Sidebar) */}
        {/* {isAuthenticated && <Navbar />} */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={isAuthenticated ? <TempHomePage /> : <Navigate to="/login" replace />}
          />
          {/*
          <Route
            path="/plans"
            element={
              <ProtectedRoute>
                <WorkoutPlansPage />
              </ProtectedRoute>
            }
          />
          */}

          {/* Add other routes here */}

          {/* Fallback route for unknown paths */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />

        </Routes>
      </div>
      {/* --- MODIFIED SECTION END --- */}
    </Router>
  );
}

// --- ProtectedRoute Component Example (Create in src/components/ProtectedRoute.jsx later) ---
// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore';

// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const location = useLocation();

//   if (!isAuthenticated) {
//     // Redirect them to the /login page, but save the current location they were
//     // trying to go to when they were redirected. This allows us to send them
//     // along to that page after they login, which is a nicer user experience
//     // than dropping them off on the home page.
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   return children;
// };

export default App;