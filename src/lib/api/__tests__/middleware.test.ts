import { NextRequest, NextResponse } from 'next/server'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { createMockUser, createMockSupabaseClient } from './middleware-test-helpers'

// Mock the Supabase module before importing the middleware
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}))

import { withAuth, getAuthenticatedUserFromRequest } from '../middleware'
import { createClient } from '@supabase/supabase-js'

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
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  describe('getAuthenticatedUserFromRequest', () => {
    it('should return null when Supabase is not configured', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const req = new NextRequest('http://localhost:3000/api/test')
      const user = await getAuthenticatedUserFromRequest(req)
      
      expect(user).toBeNull()
    })

    it('should return null when no authorization header is present', async () => {
      const req = new NextRequest('http://localhost:3000/api/test')
      const user = await getAuthenticatedUserFromRequest(req)
      
      expect(user).toBeNull()
    })

    it('should return null when authorization header is malformed', async () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Invalid token'
        }
      })
      const user = await getAuthenticatedUserFromRequest(req)
      
      expect(user).toBeNull()
    })

    it('should return null when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer test-token'
        }
      })
      const user = await getAuthenticatedUserFromRequest(req)
      
      expect(user).toBeNull()
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('test-token')
    })

    it('should return authenticated user without profile', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer test-token'
        }
      })
      const user = await getAuthenticatedUserFromRequest(req)
      
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email!
      })
    })

    it('should return authenticated user', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer test-token'
        }
      })
      const user = await getAuthenticatedUserFromRequest(req)
      
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email!
      })
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('test-token')
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
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer test-token'
        }
      })
      
      const response = await protectedHandler(req)
      
      expect(handler).toHaveBeenCalledWith(req, {
        id: mockUser.id,
        email: mockUser.email!
      })
      expect(response.status).toBe(200)
    })
  })

})