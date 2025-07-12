import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AdminLayout from '../layout'
import AdminLogin from '../(auth)/login/page'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock child components to simplify testing
vi.mock('@/components/admin/AdminHeader', () => {
  const MockAdminHeader = () => {
    const mockUseAuth = vi.mocked(useAuth)
    const { user, signOut } = mockUseAuth()
    return (
      <div data-testid="admin-header">
        {user && (
          <>
            <span data-testid="user-email">{user.email}</span>
            <button onClick={signOut} data-testid="sign-out">Sign Out</button>
          </>
        )}
      </div>
    )
  }
  MockAdminHeader.displayName = 'AdminHeader'
  return MockAdminHeader
})

vi.mock('@/components/admin/AdminSidebar', () => {
  return {
    default: function AdminSidebar() {
      return <div data-testid="admin-sidebar">Sidebar</div>
    }
  }
})

vi.mock('@/components/admin/AdminBreadcrumbs', () => {
  return {
    default: function AdminBreadcrumbs() {
      return <div data-testid="admin-breadcrumbs">Breadcrumbs</div>
    }
  }
})

describe('Admin Authentication Flow Integration', () => {
  const mockPush = vi.fn()
  const mockSignIn = vi.fn()
  const mockSignOut = vi.fn()
  const mockUseRouter = vi.mocked(useRouter)
  const mockUsePathname = vi.mocked(usePathname)
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
    mockUsePathname.mockReturnValue('/admin')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Unauthenticated User Flow', () => {
    it('should redirect unauthenticated user to login page', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      render(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth/login')
      })

      expect(screen.getByText('Authentication Required')).toBeInTheDocument()
      expect(screen.queryByText('Admin Dashboard Content')).not.toBeInTheDocument()
    })

    it('should show loading state while checking authentication', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      render(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(screen.queryByText('Admin Dashboard Content')).not.toBeInTheDocument()
    })
  })

  describe('Login Flow', () => {
    it('should allow user to login and access admin panel', async () => {
      const userInteraction = userEvent.setup()
      const adminUser = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      }

      // Start unauthenticated
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      const { rerender } = render(<AdminLogin />)

      // Fill and submit login form
      await userInteraction.type(screen.getByLabelText('Email address'), 'admin@example.com')
      await userInteraction.type(screen.getByLabelText('Password'), 'password123')
      await userInteraction.click(screen.getByRole('button', { name: 'Sign in' }))

      expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'password123')

      // Simulate successful login
      mockUseAuth.mockReturnValue({
        user: adminUser,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      rerender(<AdminLogin />)

      // Should redirect to admin dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin')
      })
    })

    it('should display error on failed login', async () => {

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: 'Invalid credentials',
      })

      render(<AdminLogin />)

      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  describe('Authenticated User Flow', () => {
    it('should display admin dashboard for authenticated admin', () => {
      const adminUser = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      }

      mockUseAuth.mockReturnValue({
        user: adminUser,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      render(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument()
      expect(screen.getByTestId('admin-header')).toBeInTheDocument()
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('admin-breadcrumbs')).toBeInTheDocument()
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@example.com')
    })

    it('should deny access for non-admin users', () => {
      const editorUser = {
        id: '456',
        email: 'editor@example.com',
        role: 'editor',
      }

      mockUseAuth.mockReturnValue({
        user: editorUser,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      render(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText("You don't have permission to access this area.")).toBeInTheDocument()
      expect(screen.queryByText('Admin Dashboard Content')).not.toBeInTheDocument()
    })
  })

  describe('Logout Flow', () => {
    it('should logout user and redirect to login page', async () => {
      const adminUser = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      }

      mockUseAuth.mockReturnValue({
        user: adminUser,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      const { rerender } = render(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      // Click sign out
      const signOutButton = screen.getByTestId('sign-out')
      await userEvent.click(signOutButton)

      expect(mockSignOut).toHaveBeenCalled()

      // Simulate logout
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      rerender(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      // Should redirect to login
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth/login')
      })
    })
  })

  describe('Session Persistence', () => {
    it('should maintain session across page refreshes', () => {
      const adminUser = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      }

      // First render - authenticated
      mockUseAuth.mockReturnValue({
        user: adminUser,
        loading: false,
        signIn: mockSignIn,
        signOut: mockSignOut,
        error: null,
      })

      const { rerender } = render(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument()

      // Simulate page refresh - still authenticated
      rerender(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      )

      expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})