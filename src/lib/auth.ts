import { type User } from '@supabase/supabase-js'
import { 
  getCurrentUser, 
  getCurrentUserProfile, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut, 
  resetPassword,
  type UserProfile 
} from './supabase'

export type AuthUser = User & {
  profile?: UserProfile
}

export async function signIn(email: string, password: string) {
  const { data, error } = await signInWithEmail(email, password)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await signUpWithEmail(email, password)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function logout() {
  const { error } = await signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function requestPasswordReset(email: string) {
  const { error } = await resetPassword(email)
  
  if (error) {
    throw new Error(error.message)
  }
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

export function hasRole(user: AuthUser | null, role: 'admin' | 'editor'): boolean {
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