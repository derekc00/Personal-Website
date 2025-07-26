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
 * DER-69: Basic Testing for Critical Admin Paths
 * 
 * Simplified testing scope focusing only on critical admin functionality:
 * - Admin login/logout flow
 * - JWT authentication on API routes  
 * - Basic CRUD operations work when authenticated
 * - 401 errors when not authenticated
 */
describe('DER-69: Critical Admin Paths', () => {
  const mockCreateServerClient = vi.mocked(createServerClient)

  const mockRequest = (headers: Record<string, string> = {}, method = 'GET') => {
    return {
      method,
      headers: {
        get: (key: string) => headers[key] || null
      }
    } as NextRequest
  }

  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    role: 'admin'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Admin JWT Authentication', () => {
    it('should authenticate admin user with valid JWT token', async () => {
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
        NextResponse.json({ success: true, data: 'protected data' })
      )

      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer valid-jwt-token' })
      const response = await wrappedHandler(request)

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: 'admin-123',
            email: 'admin@example.com'
          })
        })
      )
      expect(response.status).toBe(200)
    })

    it('should reject unauthenticated requests with 401', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = mockRequest() // No authorization header
      
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should reject invalid JWT tokens with 401', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Invalid token')
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer invalid-token' })
      
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should reject expired JWT tokens with 401', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer expired-token' })
      
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Admin CRUD Operations Authentication', () => {
    it('should allow authenticated admin to read content', async () => {
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
          data: [{ id: '1', title: 'Test Post', content: 'Test content' }] 
        })
      )

      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer admin-token' }, 'GET')
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: '1', title: 'Test Post' })
      ]))
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should allow authenticated admin to create content', async () => {
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
          data: { id: '2', title: 'New Post', content: 'New content' }
        }, { status: 201 })
      )

      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer admin-token' }, 'POST')
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(expect.objectContaining({ 
        id: '2', 
        title: 'New Post' 
      }))
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should allow authenticated admin to update content', async () => {
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
          data: { id: '1', title: 'Updated Post', content: 'Updated content' }
        })
      )

      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer admin-token' }, 'PATCH')
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(expect.objectContaining({ 
        id: '1', 
        title: 'Updated Post' 
      }))
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should allow authenticated admin to delete content', async () => {
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
      const request = mockRequest({ authorization: 'Bearer admin-token' }, 'DELETE')
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Content deleted')
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ id: 'admin-123' })
        })
      )
    })

    it('should reject CRUD operations without authentication', async () => {
      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      
      // Test all CRUD operations without auth
      const operations = ['GET', 'POST', 'PATCH', 'DELETE']
      
      for (const method of operations) {
        const request = mockRequest({}, method) // No authorization header
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Invalid authentication token')
      }

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Admin Session Management', () => {
    it('should maintain valid session for authenticated requests', async () => {
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
        NextResponse.json({ success: true, user: mockAdminUser })
      )

      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer valid-session-token' })
      const response = await wrappedHandler(request)

      expect(response.status).toBe(200)
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ 
            id: 'admin-123',
            email: 'admin@example.com' 
          })
        })
      )
    })

    it('should handle session expiration gracefully', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null
          })
        }
      }

      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as SupabaseClient)

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = mockRequest({ authorization: 'Bearer expired-session-token' })
      const response = await wrappedHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
      expect(handler).not.toHaveBeenCalled()
    })
  })
})