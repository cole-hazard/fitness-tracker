// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const register = useAuthStore((s) => s.register)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => { if (isAuthenticated) navigate('/') }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (password !== password2) errs.password2 = 'Passwords do not match.'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters long.'
    if (Object.keys(errs).length) { setError(errs); return }

    try {
      setIsLoading(true)
      await register({ username, email, password, password2 })
      navigate('/login?registered=true')
    } catch (err) {
      const api = err?.response?.data || {}
      const formatted = Object.keys(api).length
        ? Object.fromEntries(
            Object.entries(api).map(([k, v]) => [k, Array.isArray(v) ? v.join(' ') : String(v)])
          )
        : { general: 'Registration failed. Please try again.' }
      setError(formatted)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) return null

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your information to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6 pt-2">
          {error.general && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your_username"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className={`h-10 ${error.username ? 'border-destructive' : ''}`}
              />
              {error.username && (
                <p className="text-xs text-destructive">{error.username}</p>
              )}
            </div>

            {/* email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={`h-10 ${error.email ? 'border-destructive' : ''}`}
              />
              {error.email && (
                <p className="text-xs text-destructive">{error.email}</p>
              )}
            </div>

            {/* pw */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (min 8 chars)"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`h-10 ${error.password ? 'border-destructive' : ''}`}
              />
              {error.password && (
                <p className="text-xs text-destructive">{error.password}</p>
              )}
            </div>

            {/* confirm */}
            <div className="space-y-2">
              <Label htmlFor="password2" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="password2"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={isLoading}
                className={`h-10 ${error.password2 ? 'border-destructive' : ''}`}
              />
              {error.password2 && (
                <p className="text-xs text-destructive">{error.password2}</p>
              )}
            </div>

            <Button type="submit" className="mt-2 w-full h-10" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage
