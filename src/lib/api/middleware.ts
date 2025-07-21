import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { type ApiAuthenticatedUser } from '@/lib/types/auth'

/**
 * CORS configuration
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
} as const

/**
 * Adds CORS headers to a response
 */
function withCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Extended request type that includes the authenticated user and Supabase client
 */
export interface AuthenticatedRequest extends NextRequest {
  user: ApiAuthenticatedUser | null
  supabase: ReturnType<typeof createServerClient>
}

/**
 * Options for the withAuth middleware
 */
interface WithAuthOptions {
  skipAuth?: boolean
  rateLimit?: false | typeof rateLimitConfigs[keyof typeof rateLimitConfigs]
}

/**
 * Extracts and validates the authenticated user from the request
 */
async function getAuthenticatedUserFromRequest(req: NextRequest): Promise<ApiAuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    const supabase = createServerClient(token)
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) {
      console.error('[API] Authentication failed:', error.message)
      return null
    }
    
    if (!user) {
      return null
    }

    // Validate that user has an email
    if (!user.email || user.email.trim() === '') {
      console.error('[API] User authentication failed: User has no valid email')
      return null
    }

    // Additional JWT validation
    // Check if the user session is still valid by verifying the token hasn't expired
    // Supabase's getUser already validates the JWT, but we can add additional checks if needed
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('[API] Session validation failed:', sessionError?.message || 'No session found')
      return null
    }

    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
      console.error('[API] Session expired')
      return null
    }

    return {
      id: user.id,
      email: user.email
    }
  } catch (error) {
    console.error('[API] Unexpected error during authentication:', error)
    return null
  }
}

/**
 * Higher-order function that adds authentication and rate limiting to API routes
 * 
 * @param handler - The API route handler
 * @param options - Optional configuration for auth and rate limiting
 * @returns Wrapped handler with auth and rate limiting
 */
export function withAuth<T extends AuthenticatedRequest = AuthenticatedRequest>(
  handler: (req: T) => Promise<NextResponse>,
  options: WithAuthOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 })
      return withCorsHeaders(response)
    }

    try {
      // Apply rate limiting if configured
      if (options.rateLimit !== false) {
        const rateLimitConfig = options.rateLimit || rateLimitConfigs.api
        const { allowed, resetTime } = rateLimit(req, rateLimitConfig)
        
        if (!allowed) {
          const response = NextResponse.json(
            { 
              error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
              resetTime: new Date(resetTime).toISOString()
            },
            { 
              status: HTTP_STATUS.TOO_MANY_REQUESTS,
              headers: {
                'X-RateLimit-Limit': String(rateLimitConfig.limit),
                'X-RateLimit-Reset': String(resetTime),
                'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000))
              }
            }
          )
          return withCorsHeaders(response)
        }
      }
      
      // Get the auth token from the request for Supabase client
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
      
      // Create an authenticated Supabase client
      const supabaseClient = createServerClient(token)
      
      // Skip auth if configured
      if (options.skipAuth) {
        const extendedReq = Object.assign(req, { user: null, supabase: supabaseClient }) as T
        const response = await handler(extendedReq)
        return withCorsHeaders(response)
      }
      
      // Authenticate the user
      const user = await getAuthenticatedUserFromRequest(req)
      
      if (!user) {
        const response = NextResponse.json(
          { error: ERROR_MESSAGES.INVALID_TOKEN },
          { status: HTTP_STATUS.UNAUTHORIZED }
        )
        return withCorsHeaders(response)
      }
      
      // Add user and supabase client to request object
      const extendedReq = Object.assign(req, { user, supabase: supabaseClient }) as T
      
      const response = await handler(extendedReq)
      return withCorsHeaders(response)
    } catch (error) {
      // Handle ApiError instances
      if (error instanceof ApiError) {
        console.error('[API] Request failed:', error)
        const response = NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
        return withCorsHeaders(response)
      }
      
      // Handle unexpected errors
      console.error('[API] Unexpected error:', error)
      const response = NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
      return withCorsHeaders(response)
    }
  }
}

