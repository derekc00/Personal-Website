import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { userHasRole } from '@/lib/types/auth'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SessionAuthenticatedUser } from '@/lib/types/auth'

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/types/auth', () => ({
  userHasRole: vi.fn(),
}))

describe('ProtectedRoute', () => {
  const mockPush = vi.fn()
  const mockUseRouter = vi.mocked(useRouter)
  const mockUseAuth = vi.mocked(useAuth)
  const mockUserHasRole = vi.mocked(userHasRole)

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Check for the loading spinner by looking for the animate-spin class
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/auth/login')
    })
  })

  it('should show authentication required message when not authenticated and no redirect', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Authentication Required')).toBeInTheDocument()
    expect(screen.getByText('Please sign in to access this area.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/admin/auth/login')
  })

  it('should render custom fallback when provided and not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <ProtectedRoute fallback={<div>Custom Fallback</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show access denied when user lacks required role', () => {
    const mockUser: SessionAuthenticatedUser = {
      id: '123',
      email: 'editor@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      profile: {
        id: '123',
        email: 'editor@example.com',
        role: 'editor',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    } as SessionAuthenticatedUser

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })

    mockUserHasRole.mockReturnValue(false)

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Only Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.getByText("You don't have permission to access this area.")).toBeInTheDocument()
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
  })

  it('should render children when user is authenticated with correct role', () => {
    const mockUser: SessionAuthenticatedUser = {
      id: '123',
      email: 'admin@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      profile: {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    } as SessionAuthenticatedUser

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })

    mockUserHasRole.mockReturnValue(true)

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
  })

  it('should render children when user is authenticated and no role is required', () => {
    const mockUser: SessionAuthenticatedUser = {
      id: '123',
      email: 'user@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      profile: {
        id: '123',
        email: 'user@example.com',
        role: 'editor',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    } as SessionAuthenticatedUser

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })

    // Since no requiredRole is provided, userHasRole should not be called
    // but if it is called, ensure it returns true
    mockUserHasRole.mockReturnValue(true)

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should not redirect when component unmounts during loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Unmount the component
    rerender(<div>Different Content</div>)

    // Should not attempt to redirect
    expect(mockPush).not.toHaveBeenCalled()
  })
})