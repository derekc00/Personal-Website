import { type SessionAuthenticatedUser } from './types/auth'
import { createServerClient } from './supabase-ssr'

/**
 * Retrieves the authenticated user from the server session with their profile.
 * This function is designed for use in Server Components and API routes.
 * 
 * @returns The authenticated user with profile data, or null if not authenticated
 * 
 * @example
 * ```ts
 * // In a Server Component
 * const user = await getServerAuthenticatedUser()
 * if (!user) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getServerAuthenticatedUser(): Promise<SessionAuthenticatedUser | null> {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('[Auth] Failed to get user from session:', error.message)
      return null
    }
    
    if (!user) {
      return null
    }
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('[Auth] Failed to fetch user profile:', profileError.message)
    }
    
    return {
      ...user,
      profile: profile || undefined
    }
  } catch (error) {
    console.error('[Auth] Unexpected error during authentication:', error)
    return null
  }
}