import { getServerAuthenticatedUser } from '../auth-server'
import { createServerClient } from '../supabase-ssr'

// Mock the supabase-ssr module
jest.mock('../supabase-ssr')

// Mock console.error to verify error logging
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

describe('Auth Server', () => {
  const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockConsoleError.mockClear()
  })

  describe('getServerAuthenticatedUser', () => {
    it('should return authenticated user with profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'authenticated'
      }
      
      const mockProfile = {
        id: 'user-123',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            })
          })
        })
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const result = await getServerAuthenticatedUser()

      expect(result).toEqual({
        ...mockUser,
        profile: mockProfile
      })
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
    })

    it('should return user without profile when profile fetch fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'authenticated'
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Profile not found')
              })
            })
          })
        })
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const result = await getServerAuthenticatedUser()

      expect(result).toEqual({
        ...mockUser,
        profile: undefined
      })
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Failed to fetch user profile:',
        'Profile not found'
      )
    })

    it('should return null when auth.getUser fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Invalid token')
          })
        }
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const result = await getServerAuthenticatedUser()

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Failed to get user from session:',
        'Invalid token'
      )
    })

    it('should return null when no user in session', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null
          })
        }
      }

      mockCreateServerClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createServerClient>)

      const result = await getServerAuthenticatedUser()

      expect(result).toBeNull()
      expect(mockConsoleError).not.toHaveBeenCalled()
    })

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Network error')
      
      mockCreateServerClient.mockRejectedValue(unexpectedError)

      const result = await getServerAuthenticatedUser()

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Unexpected error during authentication:',
        unexpectedError
      )
    })

    it('should handle createServerClient throwing an error', async () => {
      const error = new Error('Missing environment variables')
      mockCreateServerClient.mockRejectedValue(error)

      const result = await getServerAuthenticatedUser()

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Auth] Unexpected error during authentication:',
        error
      )
    })
  })
})