import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AdminHeader from '../AdminHeader'
import { useAuth } from '@/hooks/useAuth'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('AdminHeader', () => {
  const mockPush = vi.fn()
  const mockSignOut = vi.fn()
  const mockUseRouter = vi.mocked(useRouter)
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render header with title', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  it('should display user information when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      },
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('should display editor role correctly', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '456',
        email: 'editor@example.com',
        role: 'editor',
      },
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    expect(screen.getByText('editor@example.com')).toBeInTheDocument()
    expect(screen.getByText('editor')).toBeInTheDocument()
  })

  it('should not display user info when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
    expect(screen.queryByText('@')).not.toBeInTheDocument()
  })

  it('should handle sign out correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      },
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/auth/login')
    })
  })

  it('should handle sign out errors gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign out failed'))
    
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      },
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })

    // Should still redirect even if sign out fails
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/auth/login')
    })
  })

  it('should have correct styling for sign out button', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      },
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    const signOutButton = screen.getByText('Sign Out')
    expect(signOutButton).toHaveClass('text-sm', 'text-gray-700', 'hover:text-gray-900')
  })

  it('should render email and role with correct separator', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
      },
      signOut: mockSignOut,
    })

    render(<AdminHeader />)

    // Check for the bullet separator
    expect(screen.getByText('•')).toBeInTheDocument()
    
    // Check the structure
    const userInfo = screen.getByText('admin@example.com').parentElement
    expect(userInfo).toContainElement(screen.getByText('•'))
    expect(userInfo).toContainElement(screen.getByText('admin'))
  })
})