import { http, HttpResponse } from 'msw'
import type { ContentItem } from '@/lib/schemas'
import { HTTP_STATUS, ERROR_MESSAGES, ASSET_PATHS, CONTENT_TYPES, API_ENDPOINTS } from '@/lib/constants'

const mockPosts: ContentItem[] = [
  {
    id: 'test-post-1',
    slug: 'test-post-1',
    title: 'Test Post 1',
    excerpt: 'This is a test post excerpt',
    date: '2023-12-01',
    category: 'Tech',
    image: ASSET_PATHS.TEST_IMAGE,
    type: CONTENT_TYPES.BLOG,
    tags: ['javascript', 'testing'],
    content: '# Test Post 1\nThis is test content.',
  },
  {
    id: 'test-post-2',
    slug: 'test-post-2',
    title: 'Test Post 2',
    excerpt: 'Another test post excerpt',
    date: '2023-11-01',
    category: 'Tech',
    image: null,
    type: CONTENT_TYPES.BLOG,
    tags: ['react', 'testing'],
    content: '# Test Post 2\nMore test content.',
  },
]

export const handlers = [
  // Handle GET requests to /api/posts
  http.get(API_ENDPOINTS.POSTS, ({ request }) => {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')

    if (slug) {
      const post = mockPosts.find(p => p.slug === slug)
      if (!post) {
        return HttpResponse.json({ error: ERROR_MESSAGES.POST_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND })
      }
      return HttpResponse.json(post)
    }

    return HttpResponse.json(mockPosts)
  }),
]