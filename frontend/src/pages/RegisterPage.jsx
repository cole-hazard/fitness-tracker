// src/pages/RegisterPage.jsx
// --- RegisterPage Component with Shadcn UI (Visually Aligned) ---

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState({}); // Keep as object for field-specific errors
  const [isLoading, setIsLoading] = useState(false);

  const register = useAuthStore((state) => state.register);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentErrors = {}; // Local errors for this submission

    if (password !== password2) {
      currentErrors.password2 = 'Passwords do not match.';
    }
    if (password.length < 8) {
      currentErrors.password = 'Password must be at least 8 characters long.';
    }

    if (Object.keys(currentErrors).length > 0) {
      setError(currentErrors);
      setIsLoading(false);
      return;
    }

    setError({}); // Clear previous errors before API call
    setIsLoading(true);

    try {
      const success = await register({ username, email, password, password2 });
      if (success) {
        navigate('/login?registered=true');
      }
    } catch (err) {
      let formattedError = {};
      if (err.response && err.response.data) {
        Object.keys(err.response.data).forEach(key => {
          const message = Array.isArray(err.response.data[key])
                          ? err.response.data[key].join(' ')
                          : String(err.response.data[key]);
          formattedError[key] = message;
        });
        if (Object.keys(formattedError).length === 0 && err.response.data.detail) {
          formattedError.general = err.response.data.detail;
        }
      } else {
        formattedError.general = 'Registration failed. Please try again.';
      }
      if (Object.keys(formattedError).length === 0 && !formattedError.general ) {
         formattedError.general = 'An unexpected error occurred.';
      }
      setError(formattedError);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error.general && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error.general}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your_username"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className={error.username ? "border-destructive" : ""}
              />
              {error.username && <p className="mt-1 text-xs text-destructive">{error.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={error.email ? "border-destructive" : ""}
              />
              {error.email && <p className="mt-1 text-xs text-destructive">{error.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (min 8 chars)"
                required
                minLength="8"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={error.password ? "border-destructive" : ""}
              />
              {error.password && <p className="mt-1 text-xs text-destructive">{error.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                id="password2"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={isLoading}
                className={error.password2 ? "border-destructive" : ""}
              />
              {error.password2 && <p className="mt-1 text-xs text-destructive">{error.password2}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium underline underline-offset-4 hover:text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;
