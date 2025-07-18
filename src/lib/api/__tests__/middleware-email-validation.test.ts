import { NextRequest } from 'next/server'
import { withAuth } from '../middleware'
import { createServerClient } from '@/lib/supabase-server'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/supabase-server')
vi.mock('@/lib/rate-limit')

import { rateLimit } from '@/lib/rate-limit'

describe('Email Validation Security Fix', () => {
  const mockCreateServerClient = vi.mocked(createServerClient)
  const mockRateLimit = vi.mocked(rateLimit)

  beforeEach(() => {
    vi.clearAllMocks()
    // Default to allowing rate limit
    mockRateLimit.mockReturnValue({
      allowed: true,
      resetTime: Date.now() + 60000
    })
  })

  it('should handle users without email gracefully', async () => {
    // This test should fail with the current implementation
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: {
              id: 'user-123',
              email: null // User without email - this will crash with non-null assertion
            }
          },
          error: null
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer valid-token'
      }
    })
    
    const response = await wrappedHandler(request)
    const data = await response.json()

    // Should return 401 error instead of crashing
    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle users with undefined email', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: {
              id: 'user-123',
              email: undefined
            }
          },
          error: null
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer valid-token'
      }
    })
    
    const response = await wrappedHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle users with empty string email', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: {
              id: 'user-123',
              email: ''
            }
          },
          error: null
        })
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabase as unknown)

    const handler = vi.fn()
    const wrappedHandler = withAuth(handler)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer valid-token'
      }
    })
    
    const response = await wrappedHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })
})