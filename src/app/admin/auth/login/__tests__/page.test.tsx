import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import AdminLogin from '../page'
import { useAuth } from '@/hooks/useAuth'

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

describe('AdminLogin', () => {
  const mockPush = jest.fn()
  const mockSignIn = jest.fn()
  const mockUseRouter = useRouter as jest.Mock
  const mockUseAuth = useAuth as jest.Mock

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })

    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      user: null,
      loading: false,
      error: null,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form correctly', () => {
    render(<AdminLogin />)

    expect(screen.getByText('Admin Sign In')).toBeInTheDocument()
    expect(screen.getByText('Access the administrative dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('should show loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      user: null,
      loading: true,
      error: null,
    })

    render(<AdminLogin />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(screen.queryByText('Admin Sign In')).not.toBeInTheDocument()
  })

  it('should redirect to admin dashboard when already authenticated', async () => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      user: { id: '123', email: 'admin@example.com', role: 'admin' },
      loading: false,
      error: null,
    })

    render(<AdminLogin />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('should handle form submission correctly', async () => {
    const user = userEvent.setup()
    
    render(<AdminLogin />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'admin@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.click(submitButton)

    expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'SecurePass123!')
  })

  it('should display error message when authentication fails', () => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      user: null,
      loading: false,
      error: 'Invalid email or password',
    })

    render(<AdminLogin />)

    expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
  })

  it('should disable form inputs while submitting', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<AdminLogin />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'admin@example.com')
    await user.type(passwordInput, 'password')
    
    fireEvent.click(submitButton)

    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('should show loading spinner in button while submitting', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<AdminLogin />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'admin@example.com')
    await user.type(passwordInput, 'password')
    
    fireEvent.click(submitButton)

    const spinner = submitButton.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    
    render(<AdminLogin />)

    const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password')
    const form = emailInput.closest('form')!

    // Type invalid email
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password')
    
    // Try to submit
    fireEvent.submit(form)

    // HTML5 validation should prevent submission
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should require both email and password', async () => {
    render(<AdminLogin />)

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    const form = submitButton.closest('form')!

    // Try to submit empty form
    fireEvent.submit(form)

    // Should not call signIn with empty fields
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should handle form submission errors gracefully', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<AdminLogin />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'admin@example.com')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})