import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-ssr'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'

/**
 * POST /api/admin/auth/login
 * 
 * Server-side login endpoint with rate limiting to prevent brute force attacks.
 * This endpoint provides an additional layer of security by implementing
 * rate limiting that cannot be bypassed client-side.
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const { allowed, resetTime } = rateLimit(request, rateLimitConfigs.login)
  
  if (!allowed) {
    return NextResponse.json(
      { 
        error: 'Too many login attempts. Please try again later.',
        resetTime: new Date(resetTime).toISOString()
      },
      { 
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        headers: {
          'X-RateLimit-Limit': String(rateLimitConfigs.login.limit),
          'X-RateLimit-Reset': String(resetTime),
          'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000))
        }
      }
    )
  }
  
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }
    
    const supabase = await createServerClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('[Auth] Login failed:', error.message)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }
    
    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }
    
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      }
    })
  } catch (error) {
    console.error('[Auth] Unexpected error during login:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}