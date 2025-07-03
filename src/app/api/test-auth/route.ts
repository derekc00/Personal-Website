import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-ssr'

export async function GET(request: NextRequest) {
  console.log('[TEST-AUTH] Testing Supabase connection')
  
  try {
    const supabase = await createServerClient()
    
    // Test 1: Check if we can get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('[TEST-AUTH] Session check:', {
      hasSession: !!session,
      sessionError: sessionError?.message
    })
    
    // Test 2: Check if we can get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('[TEST-AUTH] User check:', {
      hasUser: !!user,
      userError: userError?.message
    })
    
    // Test 3: Try to query the user_profiles table
    let profileError = null
    let profileData = null
    
    if (user) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      profileData = data
      profileError = error
    }
    
    return NextResponse.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      session: {
        exists: !!session,
        error: sessionError?.message
      },
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        error: userError?.message
      },
      profile: {
        exists: !!profileData,
        data: profileData,
        error: profileError?.message
      }
    })
  } catch (error) {
    console.error('[TEST-AUTH] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('[TEST-AUTH] Testing login')
  
  try {
    const { email, password } = await request.json()
    console.log('[TEST-AUTH] Attempting login for email:', email)
    
    const supabase = await createServerClient()
    
    // First, let's check if we can connect to Supabase at all
    const { data: healthCheck } = await supabase.auth.getSession()
    console.log('[TEST-AUTH] Health check - can connect to Supabase:', healthCheck !== undefined)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('[TEST-AUTH] Login result:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      error: error?.message,
      errorCode: error?.code,
      errorName: error?.name,
      errorStatus: error?.status
    })
    
    // If successful, check if we can immediately get the session
    if (data.session) {
      const { data: { session: verifySession } } = await supabase.auth.getSession()
      console.log('[TEST-AUTH] Verify session after login:', !!verifySession)
    }
    
    return NextResponse.json({
      success: !error,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email
      } : null,
      session: !!data.session,
      error: error ? {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name
      } : null
    })
  } catch (error) {
    console.error('[TEST-AUTH] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}