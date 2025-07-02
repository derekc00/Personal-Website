import { GET } from '../posts/route'
import { getContentByType, getContentBySlug } from '@/lib/content'
import type { ContentItem } from '@/lib/schemas'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { TEST_URLS, TEST_CONTENT } from '@/test/constants'

// Mock the content functions
jest.mock('@/lib/content', () => ({
  getContentByType: jest.fn(),
  getContentBySlug: jest.fn(),
}))

const mockGetContentByType = jest.mocked(getContentByType)
const mockGetContentBySlug = jest.mocked(getContentBySlug)

describe('/api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all blog posts when no slug provided', async () => {
    const mockPosts = [
      { id: '1', slug: 'post-1', title: 'Post 1', type: 'blog' },
      { id: '2', slug: 'post-2', title: 'Post 2', type: 'blog' },
    ]
    mockGetContentByType.mockResolvedValue(mockPosts as ContentItem[])

    const request = new Request(`${TEST_URLS.BASE}/api/posts`)
    const response = await GET(request)
    const data = await response.json()

    expect(mockGetContentByType).toHaveBeenCalledWith('blog')
    expect(response.status).toBe(200)
    expect(data).toEqual(mockPosts)
  })

  it('should return specific post when slug provided', async () => {
    const mockPost = { id: '1', slug: TEST_CONTENT.SLUG, title: TEST_CONTENT.TITLE, type: 'blog' }
    mockGetContentBySlug.mockResolvedValue(mockPost as ContentItem)

    const request = new Request(`${TEST_URLS.BASE}/api/posts?slug=${TEST_CONTENT.SLUG}`)
    const response = await GET(request)
    const data = await response.json()

    expect(mockGetContentBySlug).toHaveBeenCalledWith(TEST_CONTENT.SLUG)
    expect(response.status).toBe(HTTP_STATUS.OK)
    expect(data).toEqual(mockPost)
  })

  it('should return 404 when post not found', async () => {
    mockGetContentBySlug.mockResolvedValue(null)

    const request = new Request(`${TEST_URLS.BASE}/api/posts?slug=nonexistent`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
    expect(data).toEqual({ error: ERROR_MESSAGES.POST_NOT_FOUND })
  })

  it('should return 404 when content is not blog type', async () => {
    const mockProject = { id: '1', slug: 'test-project', title: 'Test Project', type: 'project' }
    mockGetContentBySlug.mockResolvedValue(mockProject as ContentItem)

    const request = new Request(`${TEST_URLS.BASE}/api/posts?slug=test-project`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
    expect(data).toEqual({ error: ERROR_MESSAGES.POST_NOT_FOUND })
  })

  it('should return 500 when error occurs', async () => {
    mockGetContentByType.mockRejectedValue(new Error('Database error'))

    const request = new Request(`${TEST_URLS.BASE}/api/posts`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(data).toEqual({ error: ERROR_MESSAGES.FAILED_TO_FETCH_POSTS })
  })
})