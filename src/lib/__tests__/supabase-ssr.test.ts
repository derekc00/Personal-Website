import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '../supabase-ssr'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock dependencies
vi.mock('next/headers')
vi.mock('@supabase/ssr')

describe('Supabase SSR', () => {
  const mockCookies = vi.mocked(cookies)
  const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient)

  const mockCookieStore = {
    get: vi.fn(),
    getAll: vi.fn(),
    set: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default cookie store mock
    mockCookies.mockResolvedValue(mockCookieStore as Parameters<typeof cookies>[0])
    mockCookieStore.getAll.mockReturnValue([])
    
    // Setup environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  describe('createServerClient', () => {
    it('should create server client with proper configuration', async () => {
      const mockSupabaseClient = { auth: {}, from: vi.fn() }
      mockCreateSupabaseServerClient.mockReturnValue(mockSupabaseClient as unknown)

      const client = await createServerClient()

      expect(mockCreateSupabaseServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function)
          })
        })
      )
      expect(client).toBe(mockSupabaseClient)
    })

    it('should handle cookie getAll operation', async () => {
      const testCookies = [
        { name: 'sb-auth-token', value: 'token123' },
        { name: 'sb-refresh-token', value: 'refresh456' }
      ]
      mockCookieStore.getAll.mockReturnValue(testCookies)

      let cookieHandler: { getAll: () => unknown; setAll: (cookies: unknown[]) => unknown }
      mockCreateSupabaseServerClient.mockImplementation((_url, _key, options) => {
        cookieHandler = options.cookies
        return { auth: {} } as unknown
      })

      await createServerClient()
      
      const result = await cookieHandler.getAll()
      expect(mockCookies).toHaveBeenCalled()
      expect(mockCookieStore.getAll).toHaveBeenCalled()
      expect(result).toEqual(testCookies)
    })

    it('should handle cookie setAll operation', async () => {
      let cookieHandler: { getAll: () => unknown; setAll: (cookies: unknown[]) => unknown }
      mockCreateSupabaseServerClient.mockImplementation((_url, _key, options) => {
        cookieHandler = options.cookies
        return { auth: {} } as unknown
      })

      await createServerClient()
      
      const cookiesToSet = [
        { name: 'sb-auth-token', value: 'newtoken', options: { httpOnly: true } },
        { name: 'sb-refresh-token', value: 'newrefresh', options: { httpOnly: true } }
      ]
      
      await cookieHandler.setAll(cookiesToSet)
      
      expect(mockCookies).toHaveBeenCalled()
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2)
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'sb-auth-token',
        'newtoken',
        { httpOnly: true }
      )
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'sb-refresh-token',
        'newrefresh',
        { httpOnly: true }
      )
    })

    it('should handle empty cookie list', async () => {
      mockCookieStore.getAll.mockReturnValue([])

      let cookieHandler: { getAll: () => unknown; setAll: (cookies: unknown[]) => unknown }
      mockCreateSupabaseServerClient.mockImplementation((_url, _key, options) => {
        cookieHandler = options.cookies
        return { auth: {} } as unknown
      })

      await createServerClient()
      
      const result = await cookieHandler.getAll()
      expect(result).toEqual([])
    })

    it('should handle setAll with empty list', async () => {
      let cookieHandler: { getAll: () => unknown; setAll: (cookies: unknown[]) => unknown }
      mockCreateSupabaseServerClient.mockImplementation((_url, _key, options) => {
        cookieHandler = options.cookies
        return { auth: {} } as unknown
      })

      await createServerClient()
      
      await cookieHandler.setAll([])
      
      expect(mockCookieStore.set).not.toHaveBeenCalled()
    })

    it('should throw error when environment variables are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      await expect(createServerClient()).rejects.toThrow()
    })

    it('should handle cookie store errors gracefully', async () => {
      mockCookies.mockRejectedValue(new Error('Cookie store unavailable'))

      await expect(createServerClient()).rejects.toThrow('Cookie store unavailable')
    })

    it('should pass through Supabase client creation errors', async () => {
      mockCreateSupabaseServerClient.mockImplementation(() => {
        throw new Error('Invalid configuration')
      })

      await expect(createServerClient()).rejects.toThrow('Invalid configuration')
    })
  })
})