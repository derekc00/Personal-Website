import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'

export type AuthenticatedUser = {
  id: string
  email: string
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

    return {
      id: user.id,
      email: user.email!
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await getAuthenticatedUser(req)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED, code: 'NO_AUTH' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    return handler(req, user)
  }
}

