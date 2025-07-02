/**
 * Common test constants to reduce duplication across test files
 */

export const TEST_USERS = {
  EDITOR: {
    id: 'user-123',
    email: 'editor@example.com'
  },
  ADMIN: {
    id: 'admin-123',
    email: 'admin@example.com'
  },
  UNAUTHORIZED: {
    id: 'unauth-123',
    email: 'unauthorized@example.com'
  }
} as const

export const TEST_CONTENT = {
  SLUG: 'test-post',
  TITLE: 'Test Post',
  EXCERPT: 'Test excerpt',
  CONTENT: 'Test content',
  CATEGORY: 'Tech',
  TAGS: ['test', 'sample']
} as const

export const TEST_ERRORS = {
  DATABASE: 'Database error',
  CONNECTION: 'Connection to database failed',
  NOT_FOUND: 'Content not found'
} as const

export const TEST_URLS = {
  BASE: 'http://localhost:3000',
  ADMIN_CONTENT: 'http://localhost:3000/api/admin/content',
  ADMIN_AUTH_ME: 'http://localhost:3000/api/admin/auth/me',
  API_POSTS: 'http://localhost:3000/api/posts',
  API_VIDEO: 'http://localhost:3000/api/video'
} as const

export const MOCK_CONTENT_ROW = {
  id: 'content-123',
  slug: TEST_CONTENT.SLUG,
  title: TEST_CONTENT.TITLE,
  excerpt: TEST_CONTENT.EXCERPT,
  date: '2024-01-01T00:00:00Z',
  category: TEST_CONTENT.CATEGORY,
  image: null,
  type: 'blog' as const,
  tags: TEST_CONTENT.TAGS,
  content: TEST_CONTENT.CONTENT,
  published: true,
  comments_enabled: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  author_id: TEST_USERS.EDITOR.id
}

export const TEST_VIDEO = {
  FILENAME: 'test-video.mp4',
  NONEXISTENT: 'nonexistent.mp4',
  BLOB_URL: 'https://blob.vercel-storage.com/test-video.mp4'
} as const