import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { createServerClient } from '@/lib/supabase-server'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock dependencies
vi.mock('@/lib/supabase-server')
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true, resetTime: Date.now() + 60000 }),
  rateLimitConfigs: {
    login: { interval: 300000, limit: 5 },
    api: { interval: 60000, limit: 30 },
    passwordReset: { interval: 3600000, limit: 3 }
  },
  clearRateLimitStore: vi.fn()
}))

/**
 * DER-69: Admin API Route Protection Tests
 * 
 * Tests focused on ensuring admin API routes are properly protected
 * and only accessible with valid JWT authentication.
 */
describe('DER-69: Admin API Route Protection', () => {
  const mockCreateServerClient = vi.mocked(createServerClient)

  const createMockRequest = (url: string, headers: Record<string, string> = {}) => {
    return new NextRequest(url, {
      headers: new Headers(headers)
    })
  }

  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    role: 'admin'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('/api/admin/content Protection', () => {
    it('should protect GET /api/admin/content with JWT authentication', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockAdminUser },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true, data: [] })
      )

      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        authorization: 'Bearer valid-jwt-token'
      })

      const response = await wrappedHandler(request)

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should reject GET /api/admin/content without JWT', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content')

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should protect POST /api/admin/content with JWT authentication', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockAdminUser },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true, data: { id: '1' } }, { status: 201 })
      )

      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        authorization: 'Bearer valid-jwt-token'
      })

      const response = await wrappedHandler(request)

      expect(response.status).toBe(201)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should reject POST /api/admin/content without JWT', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content')

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('/api/admin/auth/me Protection', () => {
    it('should protect GET /api/admin/auth/me with JWT authentication', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockAdminUser },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ 
          success: true, 
          data: { id: 'admin-123', email: 'admin@example.com' }
        })
      )

      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/auth/me', {
        authorization: 'Bearer valid-jwt-token'
      })

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(expect.objectContaining({
        id: 'admin-123',
        email: 'admin@example.com'
      }))
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should reject GET /api/admin/auth/me without JWT', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/auth/me')

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('/api/admin/content/[slug] Protection', () => {
    it('should protect PATCH /api/admin/content/[slug] with JWT authentication', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockAdminUser },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true, data: { id: '1', slug: 'test-post' } })
      )

      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post', {
        authorization: 'Bearer valid-jwt-token'
      })

      const response = await wrappedHandler(request)

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should reject PATCH /api/admin/content/[slug] without JWT', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post')

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should protect DELETE /api/admin/content/[slug] with JWT authentication', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockAdminUser },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true, message: 'Content deleted' })
      )

      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post', {
        authorization: 'Bearer valid-jwt-token'
      })

      const response = await wrappedHandler(request)

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should reject DELETE /api/admin/content/[slug] without JWT', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post')

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Invalid Token Scenarios', () => {
    it('should handle malformed JWT tokens', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('JWT malformed')
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        authorization: 'Bearer malformed.jwt.token'
      })

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle missing Bearer prefix', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        authorization: 'jwt-token-without-bearer'
      })

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle empty authorization header', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        authorization: ''
      })

      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })
  })
})