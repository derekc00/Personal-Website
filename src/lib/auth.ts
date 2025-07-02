import { 
  getCurrentUser, 
  getCurrentUserProfile
} from './supabase'
import { 
  type SessionAuthenticatedUser
} from './types/auth'


export async function getAuthenticatedUserFromSession(): Promise<SessionAuthenticatedUser | null> {
  const user = await getCurrentUser()
  if (!user) return null
  
  const profile = await getCurrentUserProfile()
  
  return {
    ...user,
    profile: profile || undefined
  }
}

