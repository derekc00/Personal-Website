import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { type UserRole } from '@/lib/schemas/auth'
import { cookies } from 'next/headers'

export type AuthenticatedUser = {
  id: string
  email: string
  role: UserRole
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase not configured')
      return null
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: async () => cookieStore.getAll(),
        setAll: async (cookies) => {
          try {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore cookie setting errors in API routes
          }
        }
      }
    })
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (!profile) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      role: profile.role as UserRole
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
  options?: { requiredRole?: UserRole }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED, code: 'NO_AUTH' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    if (options?.requiredRole) {
      if (options.requiredRole === 'admin' && user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.ACCESS_DENIED, code: 'INSUFFICIENT_ROLE' },
          { status: HTTP_STATUS.FORBIDDEN }
        )
      }
      
      if (options.requiredRole === 'editor' && !['admin', 'editor'].includes(user.role)) {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.ACCESS_DENIED, code: 'INSUFFICIENT_ROLE' },
          { status: HTTP_STATUS.FORBIDDEN }
        )
      }
    }

    return handler(req, user)
  }
}

export function withRole(role: UserRole) {
  return (handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) => {
    return withAuth(handler, { requiredRole: role })
  }
}