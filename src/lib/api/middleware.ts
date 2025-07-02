import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import { type ApiAuthenticatedUser } from '@/lib/types/auth'


export async function getAuthenticatedUserFromRequest(req: NextRequest): Promise<ApiAuthenticatedUser | null> {
  try {
    // For API routes, get the auth token from the Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)

    // Use the centralized server client with the auth token
    const supabase = createServerClient(token)
    
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
  handler: (req: NextRequest, user: ApiAuthenticatedUser) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await getAuthenticatedUserFromRequest(req)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED, code: 'NO_AUTH' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    return handler(req, user)
  }
}

