import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { type UserRole } from '@/lib/schemas/auth'

export type AuthenticatedUser = {
  id: string
  email: string
  role: UserRole
}

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured')
      return null
    }

    // For API routes, get the auth token from the Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
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
    const user = await getAuthenticatedUser(req)
    
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