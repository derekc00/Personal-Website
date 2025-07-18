import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../middleware'
import { createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/supabase-server')
vi.mock('@/lib/rate-limit')

describe('CORS Headers', () => {
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

  it('should add CORS headers to successful responses', async () => {
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
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
          },
          error: null
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    )
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer valid-token'
      }
    })
    
    const response = await wrappedHandler(request)

    // Check CORS headers
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    expect(response.headers.get('Access-Control-Max-Age')).toBe('86400')
  })

  it('should add CORS headers to error responses', async () => {
    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test')
    const response = await wrappedHandler(request)

    // Should have CORS headers even on 401 error
    expect(response.status).toBe(401)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
  })

  it('should add CORS headers to rate limit responses', async () => {
    mockRateLimit.mockReturnValue({
      allowed: false,
      resetTime: Date.now() + 30000
    })

    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer valid-token'
      }
    })
    
    const response = await wrappedHandler(request)

    expect(response.status).toBe(429)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
  })

  it('should handle OPTIONS preflight requests', async () => {
    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'OPTIONS'
    })
    
    const response = await wrappedHandler(request)

    // Should return 204 No Content for OPTIONS
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should add CORS headers when auth is skipped', async () => {
    const handler = vi.fn().mockResolvedValue(
      NextResponse.json({ public: true })
    )
    const wrappedHandler = withAuth(handler, { skipAuth: true })
    
    const request = new NextRequest('http://localhost:3000/api/test')
    const response = await wrappedHandler(request)

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
  })
})