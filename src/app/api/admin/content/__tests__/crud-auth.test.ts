import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '../route'
import { PATCH, DELETE } from '../[slug]/route'
import * as middleware from '@/lib/api/middleware'
import * as contentUtils from '@/lib/api/content-utils'
import { HTTP_STATUS } from '@/lib/constants'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ApiAuthenticatedUser } from '@/lib/types/auth'
import type { AuthenticatedRequest } from '@/lib/api/middleware'

// Mock dependencies
vi.mock('@/lib/api/middleware')
vi.mock('@/lib/api/content-utils')

/**
 * DER-69: Admin CRUD Authentication Tests
 * 
 * Focused tests ensuring CRUD operations work when authenticated
 * and are properly rejected when not authenticated.
 */
describe('DER-69: Admin CRUD Authentication', () => {
  const mockAdminUser: ApiAuthenticatedUser = {
    id: 'admin-123',
    email: 'admin@example.com'
  }

  const mockContent = {
    id: 'content-123',
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Test excerpt',
    content: 'Test content',
    category: 'blog',
    type: 'blog' as const,
    published: true,
    comments_enabled: true,
    date: '2024-01-01T00:00:00Z',
    image: null,
    tags: ['test'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    author_id: 'admin-123'
  }

  const createMockRequest = (url: string, options: { method?: string; body?: string } = {}) => {
    return new NextRequest(url, {
      method: options.method || 'GET',
      body: options.body,
      headers: new Headers({
        'content-type': 'application/json'
      })
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authenticated CRUD Operations', () => {
    it('should allow authenticated admin to READ content (GET)', async () => {
      const mockList = [mockContent]
      vi.spyOn(contentUtils, 'listContent').mockResolvedValue(mockList)
      
      // Mock withAuth to simulate authenticated request
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockAdminUser })
          return handler(extendedReq as AuthenticatedRequest)
        }
      )

      const request = createMockRequest('http://localhost:3000/api/admin/content')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockList)
      expect(contentUtils.listContent).toHaveBeenCalledWith(true, expect.any(Object))
    })

    it('should allow authenticated admin to CREATE content (POST)', async () => {
      vi.spyOn(contentUtils, 'createContent').mockResolvedValue(mockContent)
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockAdminUser })
          return handler(extendedReq as AuthenticatedRequest)
        }
      )

      const requestData = {
        title: 'New Test Post',
        excerpt: 'New test excerpt',
        content: 'New test content',
        slug: 'new-test-post'
      }

      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.CREATED)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockContent)
      expect(contentUtils.createContent).toHaveBeenCalledWith({
        ...requestData,
        author_id: mockAdminUser.id
      }, expect.any(Object))
    })

    it('should allow authenticated admin to UPDATE content (PATCH)', async () => {
      vi.spyOn(contentUtils, 'updateContent').mockResolvedValue({
        ...mockContent,
        title: 'Updated Test Post'
      })
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockAdminUser })
          return handler(extendedReq as AuthenticatedRequest)
        }
      )

      const updateData = {
        title: 'Updated Test Post',
        content: 'Updated test content'
      }

      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })
      
      // Mock params as a promise to match the actual API
      const mockParams = { params: Promise.resolve({ slug: 'test-post' }) }
      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('Updated Test Post')
      expect(contentUtils.updateContent).toHaveBeenCalledWith(
        'test-post', 
        updateData, 
        undefined
      )
    })

    it('should allow authenticated admin to DELETE content', async () => {
      vi.spyOn(contentUtils, 'deleteContent').mockResolvedValue(true)
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockAdminUser })
          return handler(extendedReq as AuthenticatedRequest)
        }
      )

      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'DELETE'
      })
      
      // Mock params as a promise to match the actual API
      const mockParams = { params: Promise.resolve({ slug: 'test-post' }) }
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data.success).toBe(true)
      expect(contentUtils.deleteContent).toHaveBeenCalledWith('test-post', true, expect.any(Object))
    })
  })

  describe('Unauthenticated CRUD Rejection', () => {
    it('should reject unauthenticated READ requests with 401', async () => {
      // Mock withAuth to simulate unauthenticated request
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        () => async () => NextResponse.json(
          { success: false, error: 'Invalid authentication token', code: 'UNAUTHORIZED' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        )
      )

      const request = createMockRequest('http://localhost:3000/api/admin/content')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
    })

    it('should reject unauthenticated create requests with 401', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        () => async () => NextResponse.json(
          { success: false, error: 'Invalid authentication token', code: 'UNAUTHORIZED' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        )
      )

      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Unauthorized Post',
          content: 'This should fail'
        })
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
    })

    it('should reject unauthenticated update requests with 401', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        () => async () => NextResponse.json(
          { success: false, error: 'Invalid authentication token', code: 'UNAUTHORIZED' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        )
      )

      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Unauthorized Update'
        })
      })
      
      const response = await PATCH(request, { params: Promise.resolve({ slug: 'test-post' }) })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
    })

    it('should reject unauthenticated delete requests with 401', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        () => async () => NextResponse.json(
          { success: false, error: 'Invalid authentication token', code: 'UNAUTHORIZED' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        )
      )

      const request = createMockRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'DELETE'
      })
      
      const response = await DELETE(request, { params: Promise.resolve({ slug: 'test-post' }) })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid authentication token')
    })
  })

  describe('Security Validations', () => {
    it('should enforce proper user context for authenticated requests', async () => {
      vi.spyOn(contentUtils, 'createContent').mockResolvedValue(mockContent)
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockAdminUser })
          return handler(extendedReq as AuthenticatedRequest)
        }
      )

      const requestData = {
        title: 'Security Test Post',
        content: 'Testing user context',
        slug: 'security-test',
        excerpt: 'Security test excerpt'
      }

      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(request)
      
      // Ensure the request was successful before checking the calls
      expect(response.status).toBe(HTTP_STATUS.CREATED)

      // Verify that the authenticated user's ID is used as author_id
      expect(contentUtils.createContent).toHaveBeenCalledWith(
        expect.objectContaining({
          ...requestData,
          author_id: mockAdminUser.id
        }),
        expect.any(Object)
      )
    })

    it('should validate request data for authenticated requests', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockAdminUser })
          return handler(extendedReq as AuthenticatedRequest)
        }
      )

      // Test with invalid data (missing required fields)
      const invalidData = {
        excerpt: 'Missing title and content'
      }

      const request = createMockRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(data.success).toBe(false)
      expect(data.code).toBe('VALIDATION_ERROR')
    })
  })
})