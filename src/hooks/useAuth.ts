import { useState, useEffect, useCallback } from 'react'
import { type AuthChangeEvent, type Session } from '@supabase/supabase-js'
import { 
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  resetPassword as supabaseResetPassword
} from '@/lib/supabase'
import { 
  getAuthenticatedUser, 
  type AuthUser 
} from '@/lib/auth'
import { 
  signInSchema, 
  resetPasswordSchema 
} from '@/lib/schemas/auth'
import { handleSupabaseError } from '@/lib/errors'
import { z } from 'zod'

export type AuthState = {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
}

export type AuthActions = {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      const user = await getAuthenticatedUser()
      setState(prev => ({ 
        ...prev, 
        user, 
        loading: false, 
        error: null 
      }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh user')
    }
  }, [setError, setLoading])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Validate input
      const validatedData = signInSchema.parse({ email, password })
      
      const { error } = await signInWithEmail(validatedData.email, validatedData.password)
      
      if (error) {
        handleSupabaseError(error)
      }
      
      await refreshUser()
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        setError(error instanceof Error ? error.message : 'Sign in failed')
      }
    }
  }, [refreshUser, setError, setLoading])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Basic validation - full validation should happen at form level
      const validatedData = signInSchema.parse({ email, password })
      
      const { data, error } = await signUpWithEmail(validatedData.email, validatedData.password)
      
      if (error) {
        handleSupabaseError(error)
      }
      
      if (data.user && !data.session) {
        setError('Please check your email to confirm your account')
        return
      }
      
      await refreshUser()
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        setError(error instanceof Error ? error.message : 'Sign up failed')
      }
    }
  }, [refreshUser, setError, setLoading])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabaseSignOut()
      
      if (error) {
        handleSupabaseError(error)
      }
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign out failed')
    }
  }, [setError, setLoading])

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true)
      
      // Validate input
      const validatedData = resetPasswordSchema.parse({ email })
      
      const { error } = await supabaseResetPassword(validatedData.email)
      
      if (error) {
        handleSupabaseError(error)
      }
      
      setLoading(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        setError(error instanceof Error ? error.message : 'Password reset failed')
      }
    }
  }, [setError, setLoading])

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw new Error(error.message)
        }
        
        if (mounted) {
          const user = session ? await getAuthenticatedUser() : null
          setState({
            user,
            session,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to get session')
        }
      }
    }

    getInitialSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return

        try {
          const user = session ? await getAuthenticatedUser() : null
          setState({
            user,
            session,
            loading: false,
            error: null
          })
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Auth state change failed')
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setError])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUser
  }
}