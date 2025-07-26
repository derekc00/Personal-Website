import { NextRequest, NextResponse } from 'next/server'
import { withAuth, ApiError, AuthenticatedRequest } from '../middleware'
import { createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/supabase-server')
vi.mock('@/lib/rate-limit')

describe('API Middleware', () => {
  const mockCreateServerClient = vi.mocked(createServerClient)
  const mockRateLimit = vi.mocked(rateLimit)
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  const mockRequest = (headers: Record<string, string> = {}) => {
    const headersObj = new Headers(headers)
    return new NextRequest('http://localhost:3000/api/test', {
      headers: headersObj
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConsoleError.mockClear()
    
    // Default to allowing rate limit
    mockRateLimit.mockReturnValue({
      allowed: true,
      resetTime: Date.now() + 60000
    })
  })

  describe('withAuth', () => {
    describe('Authentication', () => {
      it('should authenticate user and call handler with user data', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'authenticated'
        }

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null
            }),
            getSession: vi.fn().mockResolvedValue({
              data: { 
                session: {
                  access_token: 'token',
                  expires_at: Math.floor(Date.now() / 1000) + 3600
                }
              },
              error: null
            })
          }
        }

        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn().mockResolvedValue(
          NextResponse.json({ message: 'Success' })
        )

        const wrappedHandler = withAuth(handler)
        const request = mockRequest({ authorization: 'Bearer token123' })
        const response = await wrappedHandler(request)

        expect(mockSupabase.auth.getUser).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: request.headers,
            user: {
              id: 'user-123',
              email: 'test@example.com'
            }
          })
        )
        expect(response.status).toBe(200)
      })

      it('should return 401 when no authorization header', async () => {
        const handler = vi.fn()
        const wrappedHandler = withAuth(handler)
        const request = mockRequest()
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid authentication token')
        expect(handler).not.toHaveBeenCalled()
      })

      it('should return 401 when authentication fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: new Error('Invalid token')
            }),
            getSession: vi.fn().mockResolvedValue({
              data: { session: null },
              error: null
            })
          }
        }

        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn()
        const wrappedHandler = withAuth(handler)
        const request = mockRequest({ authorization: 'Bearer invalid' })
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid authentication token')
        expect(handler).not.toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[API] Authentication failed:',
          'Invalid token'
        )
        
        consoleErrorSpy.mockRestore()
      })

      it('should return 401 when no user in session', async () => {
        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null
            }),
            getSession: vi.fn().mockResolvedValue({
              data: { session: null },
              error: null
            })
          }
        }

        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn()
        const wrappedHandler = withAuth(handler)
        const request = mockRequest({ authorization: 'Bearer token' })
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid authentication token')
        expect(handler).not.toHaveBeenCalled()
      })
    })

    describe('Rate Limiting', () => {
      it('should apply rate limiting with custom config', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'authenticated'
        }

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null
            }),
            getSession: vi.fn().mockResolvedValue({
              data: { 
                session: {
                  access_token: 'token',
                  expires_at: Math.floor(Date.now() / 1000) + 3600
                }
              },
              error: null
            })
          }
        }

        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn().mockResolvedValue(
          NextResponse.json({ message: 'Success' })
        )

        const rateLimitConfig = { interval: 60000, limit: 10 }
        const wrappedHandler = withAuth(handler, { rateLimit: rateLimitConfig })
        const request = mockRequest({ authorization: 'Bearer token' })
        
        await wrappedHandler(request)

        expect(mockRateLimit).toHaveBeenCalledWith(request, rateLimitConfig)
      })

      it('should use default rate limit config when not specified', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'authenticated'
        }

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null
            }),
            getSession: vi.fn().mockResolvedValue({
              data: { 
                session: {
                  access_token: 'token',
                  expires_at: Math.floor(Date.now() / 1000) + 3600
                }
              },
              error: null
            })
          }
        }

        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn().mockResolvedValue(
          NextResponse.json({ message: 'Success' })
        )

        const wrappedHandler = withAuth(handler)
        const request = mockRequest({ authorization: 'Bearer token' })
        
        await wrappedHandler(request)

        expect(mockRateLimit).toHaveBeenCalledWith(
          request, 
          { interval: 60000, limit: 30 }
        )
      })

      it('should return 429 when rate limit exceeded', async () => {
        mockRateLimit.mockReturnValue({
          allowed: false,
          resetTime: Date.now() + 30000
        })

        const handler = vi.fn()
        const wrappedHandler = withAuth(handler)
        const request = mockRequest({ authorization: 'Bearer token' })
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(429)
        expect(data.error).toBe('Too many requests. Please try again later.')
        expect(data.resetTime).toBeDefined()
        expect(response.headers.get('X-RateLimit-Limit')).toBe('30')
        expect(response.headers.get('X-RateLimit-Reset')).toBeDefined()
        expect(response.headers.get('Retry-After')).toBeDefined()
        expect(handler).not.toHaveBeenCalled()
      })
    })

    describe('Error Handling', () => {
      it('should handle ApiError with custom status and message', async () => {
        // Skip auth to test error handling in handler
        const handler = vi.fn().mockImplementation(() => {
          throw new ApiError('Custom error message', 403)
        })

        const wrappedHandler = withAuth(handler, { skipAuth: true })
        const request = mockRequest()
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Custom error message')
      })

      it('should handle generic errors with 500 status', async () => {
        // Skip auth to test error handling in handler
        const handler = vi.fn().mockImplementation(() => {
          throw new Error('Database connection failed')
        })

        const wrappedHandler = withAuth(handler, { skipAuth: true })
        const request = mockRequest()
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })

      it('should handle authentication errors gracefully', async () => {
        // Mock authentication failure scenario
        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: new Error('Authentication service unavailable')
            }),
            getSession: vi.fn().mockResolvedValue({
              data: { session: null },
              error: null
            })
          }
        }

        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn()
        const wrappedHandler = withAuth(handler)
        const request = mockRequest({ authorization: 'Bearer token' })
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid authentication token')
        expect(handler).not.toHaveBeenCalled()
      })
    })

    describe('Options', () => {
      it('should bypass auth when skipAuth is true', async () => {
        const mockSupabase = { auth: { getUser: vi.fn() } }
        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn().mockResolvedValue(
          NextResponse.json({ message: 'Public endpoint' })
        )

        const wrappedHandler = withAuth(handler, { skipAuth: true })
        const request = mockRequest()
        
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe('Public endpoint')
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: request.headers,
            user: null,
            supabase: mockSupabase
          })
        )
        expect(mockCreateServerClient).toHaveBeenCalledWith(undefined)
      })

      it('should skip rate limiting when rateLimit is false', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'authenticated'
        }

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null
            }),
            getSession: vi.fn().mockResolvedValue({
              data: { 
                session: {
                  access_token: 'token',
                  expires_at: Math.floor(Date.now() / 1000) + 3600
                }
              },
              error: null
            })
          }
        }

        mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

        const handler = vi.fn().mockResolvedValue(
          NextResponse.json({ message: 'Success' })
        )

        const wrappedHandler = withAuth(handler, { rateLimit: false })
        const request = mockRequest({ authorization: 'Bearer token' })
        
        await wrappedHandler(request)

        expect(mockRateLimit).not.toHaveBeenCalled()
      })
    })
  })

  describe('ApiError', () => {
    it('should create error with message and status', () => {
      const error = new ApiError('Test error', 404)
      
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(404)
    })

    it('should default to status 500', () => {
      const error = new ApiError('Server error')
      
      expect(error.statusCode).toBe(500)
    })
  })

  describe('AuthenticatedRequest type', () => {
    it('should extend NextRequest with user property', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'authenticated'
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          }),
          getSession: vi.fn().mockResolvedValue({
            data: { 
              session: {
                access_token: 'token',
                expires_at: Math.floor(Date.now() / 1000) + 3600
              }
            },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

      const handler = vi.fn((req: AuthenticatedRequest) => {
        // TypeScript should recognize req.user
        expect(req.user).toEqual({
          id: 'user-123',
          email: 'test@example.com'
        })
        expect(req.headers).toBeDefined()
        return NextResponse.json({ userId: req.user?.id })
      })

      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer token' })
      
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(data.userId).toBe('user-123')
    })
  })
})