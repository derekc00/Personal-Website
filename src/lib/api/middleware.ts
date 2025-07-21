import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { type ApiAuthenticatedUser } from '@/lib/types/auth'

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

    return {
      id: user.id,
      email: user.email!
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
    try {
      // Apply rate limiting if configured
      if (options.rateLimit !== false) {
        const rateLimitConfig = options.rateLimit || rateLimitConfigs.api
        const { allowed, resetTime } = rateLimit(req, rateLimitConfig)
        
        if (!allowed) {
          return NextResponse.json(
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
        return handler(extendedReq)
      }
      
      // Authenticate the user
      const user = await getAuthenticatedUserFromRequest(req)
      
      if (!user) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.INVALID_TOKEN },
          { status: HTTP_STATUS.UNAUTHORIZED }
        )
      }
      
      // Add user and supabase client to request object
      const extendedReq = Object.assign(req, { user, supabase: supabaseClient }) as T
      
      return handler(extendedReq)
    } catch (error) {
      // Handle ApiError instances
      if (error instanceof ApiError) {
        console.error('[API] Request failed:', error)
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }
      
      // Handle unexpected errors
      console.error('[API] Unexpected error:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  }
}

