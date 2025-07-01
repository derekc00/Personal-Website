import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import * as middleware from '@/lib/api/middleware'
import * as contentUtils from '@/lib/api/content-utils'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import type { ContentRow } from '@/lib/schemas/auth'
import type { RouteHandler, MockWithRoleImplementation } from '../../__tests__/test-types'

jest.mock('@/lib/api/middleware')
jest.mock('@/lib/api/content-utils')

describe('/api/admin/content', () => {
  const mockUser = {
    id: 'user-123',
    email: 'editor@example.com',
    role: 'editor' as const
  }

  const mockContent: ContentRow = {
    id: 'content-123',
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Test excerpt',
    date: '2024-01-01T00:00:00Z',
    category: 'Tech',
    image: null,
    type: 'blog',
    tags: ['test'],
    content: 'Test content',
    published: true,
    comments_enabled: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    author_id: 'user-123'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/content', () => {
    it('should return list of all content including unpublished', async () => {
      const mockList = [mockContent]
      jest.spyOn(contentUtils, 'listContent').mockResolvedValue(mockList)
      
      // Mock withRole to execute the handler directly
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content')
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({
        success: true,
        data: mockList
      })
      expect(contentUtils.listContent).toHaveBeenCalledWith(true)
    })

    it('should handle errors gracefully', async () => {
      jest.spyOn(contentUtils, 'listContent').mockRejectedValue(new Error('Database error'))
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content')
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        code: 'LIST_ERROR'
      })
    })
  })

  describe('POST /api/admin/content', () => {
    it('should create new content with valid data', async () => {
      jest.spyOn(contentUtils, 'createContent').mockResolvedValue(mockContent)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post'
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content', {
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
      })
    })

    it('should return validation error for invalid data', async () => {
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        // Missing required fields
        excerpt: 'Test excerpt'
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content', {
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
      jest.spyOn(contentUtils, 'createContent').mockResolvedValue(null)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content'
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: 'Failed to create content',
        code: 'CREATE_ERROR'
      })
    })

    it('should handle unexpected errors', async () => {
      jest.spyOn(contentUtils, 'createContent').mockRejectedValue(new Error('Database error'))
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content'
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })
      
      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        code: 'CREATE_ERROR'
      })
    })
  })
})