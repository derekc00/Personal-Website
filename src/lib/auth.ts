import { type User } from '@supabase/supabase-js'
import { 
  getCurrentUser, 
  getCurrentUserProfile
} from './supabase'
import { 
  type UserRole,
  type UserProfile
} from './schemas/auth'

export type AuthUser = User & {
  profile?: UserProfile
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const user = await getCurrentUser()
  if (!user) return null
  
  const profile = await getCurrentUserProfile()
  
  return {
    ...user,
    profile: profile || undefined
  }
}

export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  if (!user?.profile) return false
  
  if (role === 'admin') {
    return user.profile.role === 'admin'
  }
  
  return user.profile.role === 'admin' || user.profile.role === 'editor'
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin')
}

export function canEdit(user: AuthUser | null): boolean {
  return hasRole(user, 'editor')
}