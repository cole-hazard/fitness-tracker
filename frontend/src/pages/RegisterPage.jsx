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
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <Card className="mx-auto w-full max-w-sm"> {/* ⭐ changed (same fix) */}
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error.general && (
            <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6"> {/* ⭐ changed */}
            {/* username */}
            <div className="grid gap-2">
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
                className={error.username ? 'border-destructive' : ''}
              />
              {error.username && (
                <p className="text-xs text-destructive">{error.username}</p>
              )}
            </div>

            {/* email */}
            <div className="grid gap-2">
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
                className={error.email ? 'border-destructive' : ''}
              />
              {error.email && (
                <p className="text-xs text-destructive">{error.email}</p>
              )}
            </div>

            {/* pw */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
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
                className={error.password ? 'border-destructive' : ''}
              />
              {error.password && (
                <p className="text-xs text-destructive">{error.password}</p>
              )}
            </div>

            {/* confirm */}
            <div className="grid gap-2">
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
                className={error.password2 ? 'border-destructive' : ''}
              />
              {error.password2 && (
                <p className="text-xs text-destructive">{error.password2}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="underline underline-offset-4">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage
