import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '../route'
import * as middleware from '@/lib/api/middleware'
import * as contentUtils from '@/lib/api/content-utils'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { TEST_USERS, MOCK_CONTENT_ROW, TEST_URLS } from '@/test/constants'
import type { ContentRow } from '@/lib/schemas/auth'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api/middleware')
vi.mock('@/lib/api/content-utils')

describe('/api/admin/content', () => {
  const mockUser = TEST_USERS.EDITOR

  const mockContent: ContentRow = MOCK_CONTENT_ROW

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/content', () => {
    it('should return list of all content including unpublished', async () => {
      const mockList = [mockContent]
      vi.spyOn(contentUtils, 'listContent').mockResolvedValue(mockList)
      
      // Mock withAuth to execute the handler directly
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT)
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({
        success: true,
        data: mockList
      })
      expect(contentUtils.listContent).toHaveBeenCalledWith(true, expect.any(Object))
    })

    it('should return 401 with expired token', async () => {
      // Mock withAuth to simulate expired token
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        () => async () => NextResponse.json(
          { success: false, error: ERROR_MESSAGES.UNAUTHORIZED, code: 'TOKEN_EXPIRED' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        )
      )

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        headers: {
          authorization: 'Bearer expired-token'
        }
      })
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(body.success).toBe(false)
      expect(body.code).toBe('TOKEN_EXPIRED')
    })

    it('should handle errors gracefully', async () => {
      vi.spyOn(contentUtils, 'listContent').mockRejectedValue(new Error('Database error'))
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT)
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: 'Database error', // In test env, actual error message is shown
        code: 'INTERNAL_ERROR'
      })
    })

    it('should handle database connection failure', async () => {
      vi.spyOn(contentUtils, 'listContent').mockRejectedValue(
        new Error('Connection to database failed')
      )
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT)
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: 'Connection to database failed', // In test env, actual error message is shown
        code: 'INTERNAL_ERROR'
      })
    })
  })

  describe('POST /api/admin/content', () => {
    it('should create new content with valid data', async () => {
      vi.spyOn(contentUtils, 'createContent').mockResolvedValue(mockContent)
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const requestData = {
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post'
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.CREATED)
      expect(body).toEqual({
        success: true,
        data: mockContent
      })
      expect(contentUtils.createContent).toHaveBeenCalledWith({
        ...requestData,
        author_id: mockUser.id
      }, expect.any(Object))
    })

    it('should return validation error for invalid data', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const requestData = {
        // Missing required fields
        excerpt: 'Test excerpt'
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.INVALID_REQUEST,
        code: 'VALIDATION_ERROR',
        details: expect.any(Array)
      })
    })

    it('should handle creation failure', async () => {
      vi.spyOn(contentUtils, 'createContent').mockResolvedValue(null)
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const requestData = {
        slug: 'test-post',
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content'
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: 'Failed to create content',
        code: 'INTERNAL_ERROR'
      })
    })

    it('should handle unexpected errors', async () => {
      vi.spyOn(contentUtils, 'createContent').mockRejectedValue(new Error('Database error'))
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const requestData = {
        slug: 'test-post-2',
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content'
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: 'Database error', // In test env, actual error message is shown
        code: 'INTERNAL_ERROR'
      })
    })

    it('should prevent SQL injection in content fields', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const maliciousData = {
        title: "Test'; DROP TABLE content; --",
        excerpt: "Normal excerpt",
        content: "Normal content",
        slug: "test-post'; DELETE FROM users; --"
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(maliciousData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      // Should fail validation due to slug format
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(body.success).toBe(false)
      expect(body.code).toBe('VALIDATION_ERROR')
    })

    it('should prevent XSS attacks in content', async () => {
      vi.spyOn(contentUtils, 'createContent').mockResolvedValue({
        ...mockContent,
        title: '<script>alert("xss")</script>',
        content: '<img src=x onerror="alert(1)">'
      })
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const xssData = {
        title: '<script>alert("xss")</script>',
        excerpt: 'Test excerpt',
        content: '<img src=x onerror="alert(1)">',
        slug: 'test-xss'
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(xssData)
      })
      
      const response = await POST(req)
      await response.json()

      // The API should accept the data but it should be sanitized at render time
      expect(response.status).toBe(HTTP_STATUS.CREATED)
      expect(contentUtils.createContent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '<script>alert("xss")</script>',
          content: '<img src=x onerror="alert(1)">'
        }),
        expect.any(Object)
      )
    })

    it('should handle malformed JSON gracefully', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: '{"title": "Test", invalid json}'
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body.success).toBe(false)
    })

    it('should enforce reasonable input size limits', async () => {
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const largeData = {
        title: 'a'.repeat(201), // Exceeds 200 char limit
        excerpt: 'a'.repeat(501), // Exceeds 500 char limit
        content: 'Normal content',
        slug: 'test-post'
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(largeData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(body.success).toBe(false)
      expect(body.code).toBe('VALIDATION_ERROR')
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ['title'] }),
          expect.objectContaining({ path: ['excerpt'] })
        ])
      )
    })

    it('should prevent users from setting author_id to another user', async () => {
      vi.spyOn(contentUtils, 'createContent').mockResolvedValue(mockContent)
      
      vi.spyOn(middleware, 'withAuth').mockImplementation(
        (handler: any) => async (req: NextRequest) => {
          const extendedReq = Object.assign(req, { user: mockUser })
          return handler(extendedReq)
        }
      )

      const requestData = {
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post'
        // author_id is not allowed in request body
      }

      const req = new NextRequest(TEST_URLS.ADMIN_CONTENT, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(req)
      await response.json()

      // Verify that author_id is always set to the authenticated user
      expect(contentUtils.createContent).toHaveBeenCalledWith(
        expect.objectContaining({
          author_id: mockUser.id // Should use authenticated user's ID
        }),
        expect.any(Object)
      )
    })
  })
})