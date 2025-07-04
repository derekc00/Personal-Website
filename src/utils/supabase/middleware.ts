import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Updates the user session for middleware, implementing the pattern from Supabase docs.
 * This function refreshes the session by calling getUser() which triggers a token refresh if needed.
 * 
 * @param request - The incoming Next.js request
 * @returns NextResponse with updated session cookies
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicRoute = !path.startsWith('/admin') && !path.startsWith('/api/admin')
  
  // Skip session update for public routes to improve performance
  if (isPublicRoute) {
    return NextResponse.next({ request })
  }

  // Create response that will be returned
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the session by calling getUser
  // This will refresh the access token if it's expired
  await supabase.auth.getUser()

  return supabaseResponse
}