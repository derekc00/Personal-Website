import { NextRequest } from 'next/server'
import { withAuth } from '../middleware'
import { createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/supabase-server')
vi.mock('@/lib/rate-limit')

describe('JWT Expiration Validation', () => {
  const mockCreateServerClient = vi.mocked(createServerClient)
  const mockRateLimit = vi.mocked(rateLimit)

  beforeEach(() => {
    vi.clearAllMocks()
    // Default to allowing rate limit
    mockRateLimit.mockReturnValue({
      allowed: true,
      resetTime: Date.now() + 60000
    })
  })

  it('should reject expired sessions', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: {
              id: 'user-123',
              email: 'test@example.com'
            }
          },
          error: null
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { 
            session: {
              access_token: 'token',
              expires_at: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
            }
          },
          error: null
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer expired-token'
      }
    })
    
    const response = await wrappedHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should accept valid sessions', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: {
              id: 'user-123',
              email: 'test@example.com'
            }
          },
          error: null
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { 
            session: {
              access_token: 'token',
              expires_at: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
            }
          },
          error: null
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    )
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer valid-token'
      }
    })
    
    const response = await wrappedHandler(request)

    expect(response.status).toBe(200)
    expect(handler).toHaveBeenCalled()
  })

  it('should reject when session cannot be retrieved', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: {
              id: 'user-123',
              email: 'test@example.com'
            }
          },
          error: null
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: new Error('Failed to get session')
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer invalid-session-token'
      }
    })
    
    const response = await wrappedHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle sessions without expiration time', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: {
              id: 'user-123',
              email: 'test@example.com'
            }
          },
          error: null
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { 
            session: {
              access_token: 'token',
              // No expires_at field
            }
          },
          error: null
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    )
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer valid-token'
      }
    })
    
    const response = await wrappedHandler(request)

    // Should accept sessions without expiration (trusting Supabase's validation)
    expect(response.status).toBe(200)
    expect(handler).toHaveBeenCalled()
  })
})