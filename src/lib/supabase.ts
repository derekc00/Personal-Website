import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export type ContentRow = Database['public']['Tables']['content']['Row']
export type ContentInsert = Database['public']['Tables']['content']['Insert']
export type ContentUpdate = Database['public']['Tables']['content']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

// Auth helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
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