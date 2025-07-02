import { type User } from '@supabase/supabase-js'
import { type UserProfile, type UserRole } from '@/lib/schemas/auth'

/**
 * Base authenticated user type for API routes
 * Contains minimal information needed for request authentication
 */
export type ApiAuthenticatedUser = {
  id: string
  email: string
}

/**
 * Full authenticated user type for client-side usage
 * Includes Supabase user data and optional profile
 */
export type SessionAuthenticatedUser = User & {
  profile?: UserProfile
}

/**
 * Type guard to check if a user has a profile
 */
export function hasUserProfile(user: SessionAuthenticatedUser): user is SessionAuthenticatedUser & { profile: UserProfile } {
  return user.profile !== undefined
}

/**
 * Type guard to check if a user has a specific role
 */
export function userHasRole(user: SessionAuthenticatedUser | null, role: UserRole): boolean {
  if (!user?.profile) return false
  
  if (role === 'admin') {
    return user.profile.role === 'admin'
  }
  
  // Editors have editor or admin role
  return user.profile.role === 'admin' || user.profile.role === 'editor'
}

/**
 * Check if user is an admin
 */
export function isUserAdmin(user: SessionAuthenticatedUser | null): boolean {
  return userHasRole(user, 'admin')
}

/**
 * Check if user can edit content
 */
export function canUserEdit(user: SessionAuthenticatedUser | null): boolean {
  return userHasRole(user, 'editor')
}