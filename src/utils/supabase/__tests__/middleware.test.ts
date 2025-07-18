import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '../middleware'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the @supabase/ssr module
vi.mock('@supabase/ssr')

describe('updateSession Middleware', () => {
  const mockCreateServerClient = vi.mocked(createServerClient)
  
  const mockRequest = (pathname: string, cookies: Record<string, string> = {}) => {
    const url = new URL(`http://localhost:3000${pathname}`)
    const request = new NextRequest(url)
    
    // Mock cookies
    Object.entries(cookies).forEach(([name, value]) => {
      request.cookies.set(name, value)
    })
    
    return request
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Public Routes', () => {
    it('should skip auth for public routes', async () => {
      const request = mockRequest('/')
      const response = await updateSession(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(mockCreateServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth for blog routes', async () => {
      const request = mockRequest('/blog/test-post')
      const response = await updateSession(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(mockCreateServerClient).not.toHaveBeenCalled()
    })

    it('should skip auth for about page', async () => {
      const request = mockRequest('/about')
      const response = await updateSession(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(mockCreateServerClient).not.toHaveBeenCalled()
    })
  })

  describe('Protected Routes', () => {
    it('should check auth for admin routes', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
          })
        }
      }
      
      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const request = mockRequest('/admin/dashboard')
      const response = await updateSession(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(mockCreateServerClient).toHaveBeenCalled()
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it('should check auth for admin API routes', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
          })
        }
      }
      
      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const request = mockRequest('/api/admin/users')
      const response = await updateSession(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(mockCreateServerClient).toHaveBeenCalled()
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it('should handle cookie operations correctly', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
          })
        }
      }
      
      const cookiesSetOnRequest: Array<{ name: string; value: string }> = []

      mockCreateServerClient.mockImplementation((_url, _key, options) => {
        // Test getAll cookies
        const allCookies = options.cookies.getAll()
        expect(allCookies).toEqual([])

        // Test setAll cookies
        const testCookies = [
          { name: 'auth-token', value: 'abc123', options: { httpOnly: true } },
          { name: 'refresh-token', value: 'xyz789', options: { httpOnly: true } }
        ]
        options.cookies.setAll(testCookies)

        return mockSupabase as unknown as ReturnType<typeof createServerClient>
      })

      const request = mockRequest('/admin/dashboard')
      
      // Override cookies.set to track calls
      const originalSet = request.cookies.set
      request.cookies.set = vi.fn((name, value) => {
        cookiesSetOnRequest.push({ name, value })
        return originalSet.call(request.cookies, name, value)
      })

      await updateSession(request)

      // Verify cookies were set on request
      expect(cookiesSetOnRequest).toHaveLength(2)
      expect(cookiesSetOnRequest).toContainEqual({ name: 'auth-token', value: 'abc123' })
      expect(cookiesSetOnRequest).toContainEqual({ name: 'refresh-token', value: 'xyz789' })
    })

    it('should refresh the session by calling getUser', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Session expired' }
          })
        }
      }
      
      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const request = mockRequest('/admin/settings')
      await updateSession(request)

      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
    })

    it('should pass environment variables to createServerClient', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
          })
        }
      }
      
      mockCreateServerClient.mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const request = mockRequest('/admin')
      await updateSession(request)

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function)
          })
        })
      )
    })
  })
})