import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, getAuthenticatedUser } from '../middleware'
import { createClient } from '@supabase/supabase-js'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { createMockUser, createMockSupabaseClient } from './middleware-test-helpers'

jest.mock('@supabase/supabase-js')
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({
    getAll: jest.fn(() => []),
    set: jest.fn()
  }))
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('API Middleware', () => {
  const mockProfile = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'editor',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mockSupabase as unknown as ReturnType<typeof createClient>)
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  describe('getAuthenticatedUser', () => {
    it('should return null when Supabase is not configured', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const user = await getAuthenticatedUser()
      
      expect(user).toBeNull()
    })

    it('should return null when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      
      const user = await getAuthenticatedUser()
      
      expect(user).toBeNull()
    })

    it('should return null when user profile is not found', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      mockSupabase._mocks.single.mockResolvedValue({ data: null, error: null })
      
      const user = await getAuthenticatedUser()
      
      expect(user).toBeNull()
    })

    it('should return authenticated user with profile', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      mockSupabase._mocks.single.mockResolvedValue({ data: mockProfile, error: null })
      
      const user = await getAuthenticatedUser()
      
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email!,
        role: mockProfile.role
      })
    })
  })

  describe('withAuth', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      
      const handler = jest.fn()
      const protectedHandler = await withAuth(handler)
      const req = new NextRequest('http://localhost:3000/api/test')
      
      const response = await protectedHandler(req)
      const body = await response.json()
      
      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
        code: 'NO_AUTH'
      })
      expect(handler).not.toHaveBeenCalled()
    })

    it('should call handler when user is authenticated', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      mockSupabase._mocks.single.mockResolvedValue({ data: mockProfile, error: null })
      
      const handler = jest.fn(() => 
        Promise.resolve(NextResponse.json({ success: true }))
      )
      const protectedHandler = await withAuth(handler)
      const req = new NextRequest('http://localhost:3000/api/test')
      
      const response = await protectedHandler(req)
      
      expect(handler).toHaveBeenCalledWith(req, {
        id: mockUser.id,
        email: mockUser.email!,
        role: mockProfile.role
      })
      expect(response.status).toBe(200)
    })
  })

  describe('withRole', () => {
    it('should return 403 when user does not have required admin role', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      mockSupabase._mocks.single.mockResolvedValue({ data: mockProfile, error: null })
      
      const handler = jest.fn()
      const protectedHandler = await withRole('admin')(handler)
      const req = new NextRequest('http://localhost:3000/api/test')
      
      const response = await protectedHandler(req)
      const body = await response.json()
      
      expect(response.status).toBe(HTTP_STATUS.FORBIDDEN)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.ACCESS_DENIED,
        code: 'INSUFFICIENT_ROLE'
      })
      expect(handler).not.toHaveBeenCalled()
    })

    it('should allow admin user to access admin-protected route', async () => {
      const adminProfile = { ...mockProfile, role: 'admin' }
      const mockUser = createMockUser()
      
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      mockSupabase._mocks.single.mockResolvedValue({ data: adminProfile, error: null })
      
      const handler = jest.fn(() => 
        Promise.resolve(NextResponse.json({ success: true }))
      )
      const protectedHandler = await withRole('admin')(handler)
      const req = new NextRequest('http://localhost:3000/api/test')
      
      const response = await protectedHandler(req)
      
      expect(handler).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it('should allow admin user to access editor-protected route', async () => {
      const adminProfile = { ...mockProfile, role: 'admin' }
      const mockUser = createMockUser()
      
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      mockSupabase._mocks.single.mockResolvedValue({ data: adminProfile, error: null })
      
      const handler = jest.fn(() => 
        Promise.resolve(NextResponse.json({ success: true }))
      )
      const protectedHandler = await withRole('editor')(handler)
      const req = new NextRequest('http://localhost:3000/api/test')
      
      const response = await protectedHandler(req)
      
      expect(handler).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it('should allow editor user to access editor-protected route', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      mockSupabase._mocks.single.mockResolvedValue({ data: mockProfile, error: null })
      
      const handler = jest.fn(() => 
        Promise.resolve(NextResponse.json({ success: true }))
      )
      const protectedHandler = await withRole('editor')(handler)
      const req = new NextRequest('http://localhost:3000/api/test')
      
      const response = await protectedHandler(req)
      
      expect(handler).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })
  })
})