import {
  generateSlug,
  checkSlugExists,
  generateUniqueSlug,
  createContent,
  updateContent,
  deleteContent,
  getContent,
  listContent
} from '../content-utils'
import { supabase } from '@/lib/supabase'
import type { ContentInsert } from '@/lib/schemas/auth'
import { createMockContent, createMockSupabaseQuery, setupSupabaseMock } from './content-test-helpers'

jest.mock('@/lib/supabase')

describe('Content Utils', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>
  const mockContent = createMockContent()
  let mockQuery: ReturnType<typeof createMockSupabaseQuery>

  beforeEach(() => {
    jest.clearAllMocks()
    mockQuery = createMockSupabaseQuery()
    setupSupabaseMock(mockSupabase, mockQuery)
  })

  describe('generateSlug', () => {
    it('should generate a valid slug from title', () => {
      expect(generateSlug('Hello World!')).toBe('hello-world')
      expect(generateSlug('  Test   Post  ')).toBe('test-post')
      expect(generateSlug('Special@#$Characters')).toBe('special-characters')
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should limit slug length to 100 characters', () => {
      const longTitle = 'a'.repeat(150)
      expect(generateSlug(longTitle).length).toBe(100)
    })
  })

  describe('checkSlugExists', () => {
    it('should return true when slug exists', async () => {
      mockQuery.single.mockResolvedValue({ data: { id: '123' }, error: null })

      const exists = await checkSlugExists('existing-slug')
      
      expect(exists).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('content')
      expect(mockQuery.eq).toHaveBeenCalledWith('slug', 'existing-slug')
    })

    it('should return false when slug does not exist', async () => {
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not found' } 
      })

      const exists = await checkSlugExists('non-existing-slug')
      
      expect(exists).toBe(false)
    })
  })

  describe('generateUniqueSlug', () => {
    it('should return base slug when it does not exist', async () => {
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not found' } 
      })

      const slug = await generateUniqueSlug('New Post')
      
      expect(slug).toBe('new-post')
    })

    it('should append counter when base slug exists', async () => {
      mockQuery.single
        .mockResolvedValueOnce({ data: { id: '123' }, error: null }) // new-post exists
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }) // new-post-1 doesn't exist

      const slug = await generateUniqueSlug('New Post')
      
      expect(slug).toBe('new-post-1')
    })
  })

  describe('createContent', () => {
    it('should create content with provided data', async () => {
      // Setup for insert - only one query when slug is provided
      const insertQuery = createMockSupabaseQuery()
      insertQuery.then = jest.fn().mockImplementation((resolve) => {
        return Promise.resolve(resolve({ data: mockContent, error: null }))
      })
      
      mockSupabase.from = jest.fn(() => insertQuery as unknown as ReturnType<typeof mockSupabase.from>)

      const contentData: ContentInsert & { author_id: string } = {
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post',
        author_id: 'user-123'
      }

      const result = await createContent(contentData)
      
      expect(result).toEqual(mockContent)
      expect(insertQuery.insert).toHaveBeenCalledWith({
        ...contentData,
        date: expect.any(String),
        category: 'Uncategorized',
        type: 'blog',
        tags: [],
        published: false,
        comments_enabled: true
      })
    })

    it('should generate unique slug when not provided', async () => {
      mockQuery.single
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }) // For checkSlugExists
        .mockResolvedValueOnce({ data: mockContent, error: null }) // For insert

      const contentData: ContentInsert & { author_id: string } = {
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        author_id: 'user-123'
      }

      await createContent(contentData)
      
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-post'
        })
      )
    })

    it('should return null on error', async () => {
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })

      const result = await createContent({
        title: 'Test',
        excerpt: 'Test',
        content: 'Test',
        author_id: 'user-123'
      })
      
      expect(result).toBeNull()
    })
  })

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      mockQuery.single.mockResolvedValue({ data: mockContent, error: null })

      const result = await updateContent('test-post', { title: 'Updated Title' })
      
      expect(result).toEqual(mockContent)
      expect(mockQuery.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        updated_at: expect.any(String)
      })
    })

    it('should check optimistic lock when expectedUpdatedAt is provided', async () => {
      // Mock for checking existing content
      const checkQuery = createMockSupabaseQuery()
      checkQuery.single.mockResolvedValue({ 
        data: { updated_at: '2024-01-01T00:00:00Z' }, 
        error: null 
      })
      
      mockSupabase.from = jest.fn()
        .mockReturnValueOnce(checkQuery) as typeof mockSupabase.from

      await expect(
        updateContent('test-post', { title: 'Updated' }, '2024-01-02T00:00:00Z')
      ).rejects.toThrow('OPTIMISTIC_LOCK_ERROR')
    })

    it('should return null on error', async () => {
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })

      const result = await updateContent('test-post', { title: 'Updated' })
      
      expect(result).toBeNull()
    })
  })

  describe('deleteContent', () => {
    it('should soft delete by default', async () => {
      mockQuery.eq.mockResolvedValue({ error: null })

      const result = await deleteContent('test-post')
      
      expect(result).toBe(true)
      expect(mockQuery.update).toHaveBeenCalledWith({ published: false })
    })

    it('should hard delete when specified', async () => {
      mockQuery.eq.mockResolvedValue({ error: null })

      const result = await deleteContent('test-post', false)
      
      expect(result).toBe(true)
      expect(mockQuery.delete).toHaveBeenCalled()
    })

    it('should return false on error', async () => {
      mockQuery.eq.mockResolvedValue({ error: { message: 'Error' } })

      const result = await deleteContent('test-post')
      
      expect(result).toBe(false)
    })
  })

  describe('getContent', () => {
    it('should return content when found', async () => {
      mockQuery.single.mockResolvedValue({ data: mockContent, error: null })

      const result = await getContent('test-post')
      
      expect(result).toEqual(mockContent)
      expect(mockQuery.eq).toHaveBeenCalledWith('slug', 'test-post')
    })

    it('should return null when not found', async () => {
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not found' } 
      })

      const result = await getContent('non-existing')
      
      expect(result).toBeNull()
    })
  })

  describe('listContent', () => {
    it('should list published content by default', async () => {
      const mockList = [mockContent]
      const orderQuery = { eq: jest.fn().mockResolvedValue({ data: mockList, error: null }) }
      const selectQuery = { order: jest.fn(() => orderQuery) }
      
      mockSupabase.from = jest.fn(() => ({ 
        select: jest.fn(() => selectQuery) 
      })) as typeof mockSupabase.from

      const result = await listContent()
      
      expect(result).toEqual(mockList)
      expect(orderQuery.eq).toHaveBeenCalledWith('published', true)
    })

    it('should list all content when includeUnpublished is true', async () => {
      const mockList = [mockContent]
      mockQuery.order.mockReturnValue({ 
        data: mockList, 
        error: null,
        then: jest.fn((cb) => cb({ data: mockList, error: null }))
      } as unknown as ReturnType<typeof mockQuery.order>)

      const result = await listContent(true)
      
      expect(result).toEqual(mockList)
      expect(mockQuery.order).toHaveBeenCalledWith('date', { ascending: false })
    })

    it('should return empty array on error', async () => {
      // Make order return the query itself to support chaining
      mockQuery.then = jest.fn().mockImplementation((resolve) => {
        return Promise.resolve(resolve({ data: null, error: { message: 'Error' } }))
      })

      const result = await listContent()
      
      expect(result).toEqual([])
    })
  })
})