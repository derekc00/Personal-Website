import { NextRequest, NextResponse } from 'next/server'
import type { AuthenticatedUser } from '../middleware'
import type { User } from '@supabase/supabase-js'

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  } as User
}

export function createMockSupabaseClient() {
  const singleMock = jest.fn()
  const eqMock = jest.fn(() => ({ single: singleMock }))
  const selectMock = jest.fn(() => ({ eq: eqMock }))
  const insertMock = jest.fn(() => ({ select: selectMock }))
  const updateMock = jest.fn(() => ({ eq: eqMock }))
  const deleteMock = jest.fn(() => ({ eq: eqMock }))
  const orderMock = jest.fn(() => ({ eq: eqMock }))
  
  const fromMock = jest.fn(() => ({
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    order: orderMock
  }))

  return {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn()
    },
    from: fromMock,
    // Helper methods to access nested mocks
    _mocks: {
      single: singleMock,
      eq: eqMock,
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
      order: orderMock
    }
  }
}

export function createMockMiddleware() {
  return (role?: string) => {
    return (handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) => {
      return (req: NextRequest) => handler(req, {
        id: 'user-123',
        email: 'test@example.com',
        role: (role || 'editor') as 'admin' | 'editor'
      })
    }
  }
}