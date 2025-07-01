import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from '../route'
import * as middleware from '@/lib/api/middleware'
import * as contentUtils from '@/lib/api/content-utils'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import type { ContentRow } from '@/lib/schemas/auth'
import type { RouteHandler, MockWithRoleImplementation } from '../../../__tests__/test-types'

jest.mock('@/lib/api/middleware')
jest.mock('@/lib/api/content-utils')

describe('/api/admin/content/[slug]', () => {
  const mockUser = {
    id: 'user-123',
    email: 'editor@example.com',
    role: 'editor' as const
  }

  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    role: 'admin' as const
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

  const mockParams = Promise.resolve({ slug: 'test-post' })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/content/[slug]', () => {
    it('should return content when found', async () => {
      jest.spyOn(contentUtils, 'getContent').mockResolvedValue(mockContent)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post')
      const response = await GET(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({
        success: true,
        data: mockContent
      })
      expect(contentUtils.getContent).toHaveBeenCalledWith('test-post')
    })

    it('should return 404 when content not found', async () => {
      jest.spyOn(contentUtils, 'getContent').mockResolvedValue(null)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content/non-existing')
      const response = await GET(req, { params: Promise.resolve({ slug: 'non-existing' }) })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.CONTENT_NOT_FOUND,
        code: 'NOT_FOUND'
      })
    })

    it('should handle errors gracefully', async () => {
      jest.spyOn(contentUtils, 'getContent').mockRejectedValue(new Error('Database error'))
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post')
      const response = await GET(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        code: 'GET_ERROR'
      })
    })
  })

  describe('PATCH /api/admin/content/[slug]', () => {
    it('should update content with valid data', async () => {
      const updatedContent = { ...mockContent, title: 'Updated Title' }
      jest.spyOn(contentUtils, 'updateContent').mockResolvedValue(updatedContent)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        title: 'Updated Title'
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'PATCH',
        body: JSON.stringify(requestData)
      })
      
      const response = await PATCH(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({
        success: true,
        data: updatedContent
      })
      expect(contentUtils.updateContent).toHaveBeenCalledWith(
        'test-post',
        requestData,
        undefined
      )
    })

    it('should handle optimistic locking', async () => {
      jest.spyOn(contentUtils, 'updateContent').mockRejectedValue(
        new Error('OPTIMISTIC_LOCK_ERROR')
      )
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        title: 'Updated Title',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'PATCH',
        body: JSON.stringify(requestData)
      })
      
      const response = await PATCH(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.CONFLICT)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.OPTIMISTIC_LOCK_ERROR,
        code: 'OPTIMISTIC_LOCK_ERROR'
      })
    })

    it('should return validation error for invalid data', async () => {
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        type: 'invalid-type' // Invalid enum value
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'PATCH',
        body: JSON.stringify(requestData)
      })
      
      const response = await PATCH(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.INVALID_REQUEST,
        code: 'VALIDATION_ERROR',
        details: expect.any(Array)
      })
    })

    it('should return 404 when content not found', async () => {
      jest.spyOn(contentUtils, 'updateContent').mockResolvedValue(null)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockUser)
      )

      const requestData = {
        title: 'Updated Title'
      }

      const req = new NextRequest('http://localhost:3000/api/admin/content/non-existing', {
        method: 'PATCH',
        body: JSON.stringify(requestData)
      })
      
      const response = await PATCH(req, { params: Promise.resolve({ slug: 'non-existing' }) })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.CONTENT_NOT_FOUND,
        code: 'NOT_FOUND'
      })
    })
  })

  describe('DELETE /api/admin/content/[slug]', () => {
    it('should soft delete content by default', async () => {
      jest.spyOn(contentUtils, 'deleteContent').mockResolvedValue(true)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockAdminUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'DELETE'
      })
      
      const response = await DELETE(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(body).toEqual({ success: true })
      expect(contentUtils.deleteContent).toHaveBeenCalledWith('test-post', true)
    })

    it('should hard delete when specified', async () => {
      jest.spyOn(contentUtils, 'deleteContent').mockResolvedValue(true)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockAdminUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post?hard=true', {
        method: 'DELETE'
      })
      
      const response = await DELETE(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(body).toEqual({ success: true })
      expect(contentUtils.deleteContent).toHaveBeenCalledWith('test-post', false)
    })

    it('should return 404 when content not found', async () => {
      jest.spyOn(contentUtils, 'deleteContent').mockResolvedValue(false)
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockAdminUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content/non-existing', {
        method: 'DELETE'
      })
      
      const response = await DELETE(req, { params: Promise.resolve({ slug: 'non-existing' }) })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.CONTENT_NOT_FOUND,
        code: 'NOT_FOUND'
      })
    })

    it('should handle errors gracefully', async () => {
      jest.spyOn(contentUtils, 'deleteContent').mockRejectedValue(new Error('Database error'))
      
      jest.spyOn(middleware, 'withRole').mockImplementation<MockWithRoleImplementation>(
        () => (handler: RouteHandler) => (req: NextRequest) => handler(req, mockAdminUser)
      )

      const req = new NextRequest('http://localhost:3000/api/admin/content/test-post', {
        method: 'DELETE'
      })
      
      const response = await DELETE(req, { params: mockParams })
      const body = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(body).toEqual({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        code: 'DELETE_ERROR'
      })
    })
  })
})