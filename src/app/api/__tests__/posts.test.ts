import { describe, it, expect, vi } from 'vitest'
import { GET } from '../posts/route'
import { getContentByType, getContentBySlug } from '@/lib/content'
import type { ContentItem } from '@/lib/schemas'

// Mock the content functions
vi.mock('@/lib/content', () => ({
  getContentByType: vi.fn(),
  getContentBySlug: vi.fn(),
}))

const mockGetContentByType = vi.mocked(getContentByType)
const mockGetContentBySlug = vi.mocked(getContentBySlug)

describe('/api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all blog posts when no slug provided', async () => {
    const mockPosts = [
      { id: '1', slug: 'post-1', title: 'Post 1', type: 'blog' },
      { id: '2', slug: 'post-2', title: 'Post 2', type: 'blog' },
    ]
    mockGetContentByType.mockResolvedValue(mockPosts as ContentItem[])

    const request = new Request('http://localhost:3000/api/posts')
    const response = await GET(request)
    const data = await response.json()

    expect(mockGetContentByType).toHaveBeenCalledWith('blog')
    expect(response.status).toBe(200)
    expect(data).toEqual(mockPosts)
  })

  it('should return specific post when slug provided', async () => {
    const mockPost = { id: '1', slug: 'test-post', title: 'Test Post', type: 'blog' }
    mockGetContentBySlug.mockResolvedValue(mockPost as ContentItem)

    const request = new Request('http://localhost:3000/api/posts?slug=test-post')
    const response = await GET(request)
    const data = await response.json()

    expect(mockGetContentBySlug).toHaveBeenCalledWith('test-post')
    expect(response.status).toBe(200)
    expect(data).toEqual(mockPost)
  })

  it('should return 404 when post not found', async () => {
    mockGetContentBySlug.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/posts?slug=nonexistent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Post not found' })
  })

  it('should return 404 when content is not blog type', async () => {
    const mockProject = { id: '1', slug: 'test-project', title: 'Test Project', type: 'project' }
    mockGetContentBySlug.mockResolvedValue(mockProject as ContentItem)

    const request = new Request('http://localhost:3000/api/posts?slug=test-project')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Post not found' })
  })

  it('should return 500 when error occurs', async () => {
    mockGetContentByType.mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/posts')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch posts' })
  })
})