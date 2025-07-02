import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { userHasRole } from '@/lib/types/auth'

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/types/auth', () => ({
  userHasRole: jest.fn(),
}))

describe('ProtectedRoute', () => {
  const mockPush = jest.fn()
  const mockUseRouter = useRouter as jest.Mock
  const mockUseAuth = useAuth as jest.Mock
  const mockUserHasRole = userHasRole as jest.Mock

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
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
    const mockUser: AuthUser = {
      id: '123',
      email: 'editor@example.com',
      role: 'editor',
    }

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
    const mockUser: AuthUser = {
      id: '123',
      email: 'admin@example.com',
      role: 'admin',
    }

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
    const mockUser: AuthUser = {
      id: '123',
      email: 'user@example.com',
      role: 'editor',
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should not redirect when component unmounts during loading', () => {
    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })

    // Unmount the component
    rerender(<div>Different Content</div>)

    // Should not attempt to redirect
    expect(mockPush).not.toHaveBeenCalled()
  })
})