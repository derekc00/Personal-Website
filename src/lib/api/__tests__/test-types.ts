import { NextRequest, NextResponse } from 'next/server'
import { type ApiAuthenticatedUser } from '@/lib/types/auth'
import type { User } from '@supabase/supabase-js'

export type MockHandler = (req: NextRequest, user: ApiAuthenticatedUser) => Promise<NextResponse>
export type MockMiddleware = (handler: MockHandler) => (req: NextRequest) => Promise<NextResponse>
export type MockWithRole = (role: string) => MockMiddleware

export type MockSupabaseAuth = {
  getUser: jest.Mock
  getSession: jest.Mock
  signInWithPassword: jest.Mock
  signUp: jest.Mock
  signOut: jest.Mock
  resetPasswordForEmail: jest.Mock
  onAuthStateChange: jest.Mock
}

export type MockSupabaseFrom = {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  eq: jest.Mock
  single: jest.Mock
  order: jest.Mock
}

export type MockSupabaseClient = {
  auth: MockSupabaseAuth
  from: jest.Mock<MockSupabaseFrom>
}

export type MockUser = Pick<User, 'id' | 'email'>

export type MockUserProfile = {
  id: string
  email: string
  role: 'admin' | 'editor'
  created_at: string
  updated_at: string
}