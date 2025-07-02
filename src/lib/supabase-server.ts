import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client with a custom auth token for server-side operations
export function createServerClient(authToken?: string) {
  const options = authToken
    ? {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    : {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, options)
}