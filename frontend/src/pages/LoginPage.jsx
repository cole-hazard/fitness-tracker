// src/pages/LoginPage.jsx
// --- LoginPage Component with Shadcn UI (Visually Aligned) ---

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Optional: For loading spinner icon
// import { Loader2 } from "lucide-react";

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('registered') === 'true') {
      setSuccessMessage('Registration successful! Please log in.');
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const success = await login({ username, password });
      if (success) {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail ||
                           err.response?.data?.non_field_errors?.[0] ||
                           'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    // This outer div centers the card on the page and applies a dark theme background
    // Ensure your `App.jsx` or `index.html` applies the `dark` class if you want a dark theme by default
    // Or, your Shadcn theme is configured for dark mode.
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-sm"> {/* Removed mx-auto as flex centering handles it */}
        <CardHeader className="space-y-1 text-center"> {/* Added text-center and space-y-1 */}
          <CardTitle className="text-2xl font-bold">Login</CardTitle> {/* Added font-bold */}
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-100 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}
          {error && !successMessage && ( // Only show general error if no success message
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4"> {/* Use space-y for gap */}
            <div className="space-y-2"> {/* Replaced grid with space-y */}
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your_username" // Or m@example.com if you want to hint at email
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2"> {/* Replaced grid with space-y */}
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password" // Update this route
                  className="ml-auto inline-block text-sm underline underline-offset-4 hover:text-primary"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••" // Password placeholder
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : 'Login'}
            </Button>
            {/* The Shadcn block has a "Login with Google" button. Keeping structure. */}
            <Button variant="outline" className="w-full" type="button" onClick={() => alert('Google login not implemented yet!')} disabled={isLoading}>
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
