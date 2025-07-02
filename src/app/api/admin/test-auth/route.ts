import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  return withAuth(async (req: NextRequest, user) => {
    // Get the auth token from the request
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
    
    // Create an authenticated Supabase client
    const supabaseClient = createServerClient(token)
    
    // Test if we can get the current user
    const { data: { user: supabaseUser }, error } = await supabaseClient.auth.getUser()
    
    return NextResponse.json({
      success: true,
      middlewareUser: user,
      supabaseUser: supabaseUser ? {
        id: supabaseUser.id,
        email: supabaseUser.email
      } : null,
      error: error?.message,
      hasToken: !!token
    })
  })(req)
}