import { type SessionAuthenticatedUser } from './types/auth'
import { createServerClient } from './supabase-ssr'

export async function getServerAuthenticatedUser(): Promise<SessionAuthenticatedUser | null> {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return {
      ...user,
      profile: profile || undefined
    }
  } catch (error) {
    return null
  }
}