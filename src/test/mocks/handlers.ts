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

// Mock user data for authentication tests
const mockUsers = {
  'admin@example.com': {
    id: 'admin-user-123',
    email: 'admin@example.com',
    role: 'admin',
    password: 'password123',
  },
  'test@example.com': {
    id: 'test-user-456', 
    email: 'test@example.com',
    role: 'authenticated',
    password: 'password123',
  },
}

const mockSessions = new Map<string, {
  user: typeof mockUsers[keyof typeof mockUsers],
  access_token: string,
  refresh_token: string,
  expires_at: number,
}>()

// Helper function to generate mock tokens
const generateToken = () => 'mock-token-' + Math.random().toString(36).substr(2, 9)

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

  // Supabase Auth Endpoints
  // POST /auth/v1/token - Login/Sign in with password
  http.post('https://*/auth/v1/token', async ({ request }) => {
    const body = await request.json() as { email?: string, password?: string, grant_type?: string, refresh_token?: string }
    const { email, password, grant_type } = body

    if (grant_type === 'password' && email && password) {
      const user = mockUsers[email as keyof typeof mockUsers]
      
      if (user && user.password === password) {
        const access_token = generateToken()
        const refresh_token = generateToken()
        const expires_at = Date.now() + 3600000 // 1 hour
        
        mockSessions.set(access_token, {
          user,
          access_token,
          refresh_token,
          expires_at,
        })

        return HttpResponse.json({
          access_token,
          refresh_token,
          expires_in: 3600,
          expires_at,
          token_type: 'bearer',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            aud: 'authenticated',
            app_metadata: { role: user.role },
            user_metadata: {},
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          }
        })
      }
      
      return HttpResponse.json(
        { error: 'Invalid login credentials', error_description: 'Invalid login credentials' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    if (grant_type === 'refresh_token') {
      // Handle refresh token flow
      const refresh_token = body.refresh_token
      const session = Array.from(mockSessions.values()).find(s => s.refresh_token === refresh_token)
      
      if (session) {
        const new_access_token = generateToken()
        const new_refresh_token = generateToken()
        const expires_at = Date.now() + 3600000
        
        mockSessions.delete(session.access_token)
        mockSessions.set(new_access_token, {
          ...session,
          access_token: new_access_token,
          refresh_token: new_refresh_token,
          expires_at,
        })

        return HttpResponse.json({
          access_token: new_access_token,
          refresh_token: new_refresh_token,
          expires_in: 3600,
          expires_at,
          token_type: 'bearer',
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            aud: 'authenticated',
            app_metadata: { role: session.user.role },
            user_metadata: {},
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          }
        })
      }
      
      return HttpResponse.json(
        { error: 'Invalid refresh token' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return HttpResponse.json(
      { error: 'Unsupported grant type' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }),

  // GET /auth/v1/user - Get current user
  http.get('https://*/auth/v1/user', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const session = mockSessions.get(token)
    
    if (!session || session.expires_at < Date.now()) {
      return HttpResponse.json(
        { error: 'Invalid or expired token' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    return HttpResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      aud: 'authenticated',
      app_metadata: { role: session.user.role },
      user_metadata: {},
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
    })
  }),

  // POST /auth/v1/logout - Sign out
  http.post('https://*/auth/v1/logout', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      mockSessions.delete(token)
    }

    return HttpResponse.json({}, { status: HTTP_STATUS.NO_CONTENT })
  }),

  // POST /auth/v1/signup - User registration
  http.post('https://*/auth/v1/signup', async ({ request }) => {
    const body = await request.json() as { email?: string, password?: string }
    const { email, password } = body

    if (!email || !password) {
      return HttpResponse.json(
        { error: 'Email and password are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Check if user already exists
    if (mockUsers[email as keyof typeof mockUsers]) {
      return HttpResponse.json(
        { error: 'User already registered' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const newUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      role: 'authenticated',
      password,
    }

    // In a real scenario, you'd add the user to the database
    // For testing, we can simulate successful signup
    return HttpResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        aud: 'authenticated',
        app_metadata: { role: newUser.role },
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      session: null, // Typically null for signup requiring email confirmation
    })
  }),

  // GET /auth/v1/session - Get current session
  http.get('https://*/auth/v1/session', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        data: { session: null, user: null },
        error: null
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const session = mockSessions.get(token)
    
    if (!session || session.expires_at < Date.now()) {
      return HttpResponse.json({
        data: { session: null, user: null },
        error: null
      })
    }

    return HttpResponse.json({
      data: {
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: Math.floor((session.expires_at - Date.now()) / 1000),
          expires_at: session.expires_at,
          token_type: 'bearer',
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            aud: 'authenticated',
            app_metadata: { role: session.user.role },
            user_metadata: {},
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          }
        },
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          aud: 'authenticated',
          app_metadata: { role: session.user.role },
          user_metadata: {},
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        }
      },
      error: null
    })
  }),

  // POST /auth/v1/recover - Password reset
  http.post('https://*/auth/v1/recover', async ({ request }) => {
    const body = await request.json() as { email?: string }
    const { email } = body

    if (!email) {
      return HttpResponse.json(
        { error: 'Email is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Simulate successful password reset request
    return HttpResponse.json({})
  }),

  // Supabase Database endpoints for user profiles
  // GET /rest/v1/user_profiles
  http.get('https://*/rest/v1/user_profiles', ({ request }) => {
    const url = new URL(request.url)
    // const select = url.searchParams.get('select')
    const userId = url.searchParams.get('id')?.replace('eq.', '')
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Missing authorization header' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const session = mockSessions.get(token)
    
    if (!session) {
      return HttpResponse.json(
        { error: 'Invalid token' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    // Mock user profile data
    const profile = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
    }

    if (userId && userId === session.user.id) {
      return HttpResponse.json([profile])
    }

    return HttpResponse.json([profile])
  }),
]