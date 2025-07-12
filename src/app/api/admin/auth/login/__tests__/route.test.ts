import { NextRequest } from 'next/server'
import { POST } from '../route'
import { createServerClient } from '@/lib/supabase-ssr'
import { rateLimit } from '@/lib/rate-limit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/supabase-ssr')
vi.mock('@/lib/rate-limit')

// Mock console.error
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Login API Route', () => {
  const mockCreateServerClient = vi.mocked(createServerClient)
  const mockRateLimit = vi.mocked(rateLimit)

  const mockRequest = (body: unknown, headers: Record<string, string> = {}) => {
    return {
      json: vi.fn().mockResolvedValue(body),
      headers: {
        get: (key: string) => headers[key] || null
      }
    } as unknown as NextRequest
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConsoleError.mockClear()
    
    // Default to allowing rate limit
    mockRateLimit.mockReturnValue({
      allowed: true,
      resetTime: Date.now() + 300000
    })
  })

  describe('Rate Limiting', () => {
    it('should block requests when rate limit exceeded', async () => {
      mockRateLimit.mockReturnValue({
        allowed: false,
        resetTime: Date.now() + 60000
      })

      const request = mockRequest({ email: 'test@example.com', password: 'password' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Too many login attempts. Please try again later.')
      expect(data.resetTime).toBeDefined()
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined()
      expect(response.headers.get('Retry-After')).toBeDefined()
    })

    it('should use login rate limit config', async () => {
      const request = mockRequest({ email: 'test@example.com', password: 'password' })
      await POST(request)

      expect(mockRateLimit).toHaveBeenCalledWith(
        request,
        { interval: 300000, limit: 5 }
      )
    })
  })

  describe('Input Validation', () => {
    it('should return 400 when email is missing', async () => {
      const request = mockRequest({ password: 'password' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
      expect(mockCreateServerClient).not.toHaveBeenCalled()
    })

    it('should return 400 when password is missing', async () => {
      const request = mockRequest({ email: 'test@example.com' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
      expect(mockCreateServerClient).not.toHaveBeenCalled()
    })

    it('should return 400 when both fields are missing', async () => {
      const request = mockRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
      expect(mockCreateServerClient).not.toHaveBeenCalled()
    })
  })

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'authenticated'
      }
      const mockSession = { access_token: 'token', refresh_token: 'refresh' }

      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null
          })
        }
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as ReturnType<typeof createServerClient>)

      const request = mockRequest({ 
        email: 'test@example.com', 
        password: 'password123' 
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'authenticated'
      })
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should return 401 for invalid credentials', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: new Error('Invalid login credentials')
          })
        }
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as ReturnType<typeof createServerClient>)

      const request = mockRequest({ 
        email: 'test@example.com', 
        password: 'wrongpassword' 
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Login failed:',
        'Invalid login credentials'
      )
    })

    it('should return 401 when no user data returned', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: null
          })
        }
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as ReturnType<typeof createServerClient>)

      const request = mockRequest({ 
        email: 'test@example.com', 
        password: 'password' 
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Login failed')
    })

    it('should return 401 when no session returned', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' }, session: null },
            error: null
          })
        }
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as ReturnType<typeof createServerClient>)

      const request = mockRequest({ 
        email: 'test@example.com', 
        password: 'password' 
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Login failed')
    })
  })

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const request = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: {
          get: vi.fn()
        }
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An unexpected error occurred')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Unexpected error during login:',
        expect.any(Error)
      )
    })

    it('should handle Supabase client creation errors', async () => {
      mockCreateServerClient.mockRejectedValue(new Error('Database connection failed'))

      const request = mockRequest({ 
        email: 'test@example.com', 
        password: 'password' 
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An unexpected error occurred')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Unexpected error during login:',
        expect.any(Error)
      )
    })

    it('should handle unexpected errors during authentication', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockRejectedValue(new Error('Network error'))
        }
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as ReturnType<typeof createServerClient>)

      const request = mockRequest({ 
        email: 'test@example.com', 
        password: 'password' 
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('An unexpected error occurred')
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Unexpected error during login:',
        expect.any(Error)
      )
    })
  })
})