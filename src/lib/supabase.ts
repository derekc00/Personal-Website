import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from './supabase-browser'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Creates a dummy Supabase client for build-time compatibility.
 * 
 * This pattern is necessary because:
 * 1. Next.js evaluates modules at build time, even if they're only used client-side
 * 2. Vercel and other platforms may not have environment variables during build
 * 3. The Supabase SDK throws errors if initialized without valid URLs/keys
 * 
 * The dummy client prevents build failures while ensuring proper error messages
 * if someone tries to use auth features without configuration.
 */
const createDummyClient = (): SupabaseClient => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
        single: async () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
    }),
  } as unknown as SupabaseClient
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient()
  : createDummyClient()

// Database types (will be generated from Supabase schema)
export type Database = {
  public: {
    Tables: {
      content: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          date: string
          category: string
          image: string | null
          type: 'blog' | 'project'
          tags: string[]
          content: string
          published: boolean
          comments_enabled: boolean
          created_at: string
          updated_at: string
          author_id: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt: string
          date: string
          category: string
          image?: string | null
          type?: 'blog' | 'project'
          tags?: string[]
          content: string
          published?: boolean
          comments_enabled?: boolean
          created_at?: string
          updated_at?: string
          author_id?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string
          date?: string
          category?: string
          image?: string | null
          type?: 'blog' | 'project'
          tags?: string[]
          content?: string
          published?: boolean
          comments_enabled?: boolean
          created_at?: string
          updated_at?: string
          author_id?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'editor'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'editor'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'editor'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Types are now exported from schemas/auth.ts to maintain single source of truth

// Auth helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({ email, password })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email)
}