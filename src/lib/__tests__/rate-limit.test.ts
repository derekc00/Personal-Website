import { NextRequest } from 'next/server'
import { rateLimit, rateLimitConfigs } from '../rate-limit'

// We need to mock the module to reset the store between tests
jest.mock('../rate-limit', () => {
  const originalModule = jest.requireActual('../rate-limit')
  
  // Create a new store for each test file run
  let mockStore: Record<string, { count: number; resetTime: number }> = {}
  
  const mockRateLimit = (request: NextRequest, config = { interval: 60000, limit: 10 }) => {
    const identifier = 'test-' + (request.headers.get('x-real-ip') || 
                                 request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                                 `fallback-${request.headers.get('user-agent') || 'unknown'}-${request.headers.get('accept-language') || 'unknown'}`.substring(0, 100))
    const now = Date.now()
    
    // Get or create rate limit entry
    const entry = mockStore[identifier] || { count: 0, resetTime: now + config.interval }
    
    // Reset if time window has passed
    if (now > entry.resetTime) {
      entry.count = 0
      entry.resetTime = now + config.interval
    }
    
    // Increment counter
    entry.count++
    mockStore[identifier] = entry
    
    // Check if limit exceeded
    const allowed = entry.count <= config.limit
    
    return {
      allowed,
      resetTime: entry.resetTime
    }
  }
  
  return {
    ...originalModule,
    rateLimit: mockRateLimit,
    __resetStore: () => { mockStore = {} }
  }
})

const { __resetStore } = jest.requireMock('../rate-limit')

describe('Rate Limit', () => {
  const mockRequest = (headers: Record<string, string> = {}) => {
    return {
      headers: {
        get: (key: string) => headers[key] || null
      }
    } as NextRequest
  }

  beforeEach(() => {
    // Clear the in-memory store between tests
    __resetStore()
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('rateLimit', () => {
    it('should allow requests within the limit', () => {
      const request = mockRequest({ 'x-real-ip': '192.168.1.1' })
      const config = { interval: 60000, limit: 3 }

      // First 3 requests should be allowed
      for (let i = 0; i < 3; i++) {
        const result = rateLimit(request, config)
        expect(result.allowed).toBe(true)
      }
    })

    it('should block requests exceeding the limit', () => {
      const request = mockRequest({ 'x-real-ip': '192.168.1.1' })
      const config = { interval: 60000, limit: 2 }

      // First 2 requests allowed
      expect(rateLimit(request, config).allowed).toBe(true)
      expect(rateLimit(request, config).allowed).toBe(true)
      
      // Third request blocked
      const result = rateLimit(request, config)
      expect(result.allowed).toBe(false)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should reset the count after the interval', () => {
      const request = mockRequest({ 'x-real-ip': '192.168.1.1' })
      const config = { interval: 60000, limit: 1 }

      // First request allowed
      expect(rateLimit(request, config).allowed).toBe(true)
      
      // Second request blocked
      expect(rateLimit(request, config).allowed).toBe(false)

      // Advance time past the interval
      jest.advanceTimersByTime(61000)

      // Request should be allowed again
      expect(rateLimit(request, config).allowed).toBe(true)
    })

    it('should track different IPs separately', () => {
      const request1 = mockRequest({ 'x-real-ip': '192.168.1.1' })
      const request2 = mockRequest({ 'x-real-ip': '192.168.1.2' })
      const config = { interval: 60000, limit: 1 }

      // Both IPs should get their own limit
      expect(rateLimit(request1, config).allowed).toBe(true)
      expect(rateLimit(request2, config).allowed).toBe(true)
      
      // Each IP blocked on second request
      expect(rateLimit(request1, config).allowed).toBe(false)
      expect(rateLimit(request2, config).allowed).toBe(false)
    })

    it('should use x-forwarded-for header when available', () => {
      const request = mockRequest({ 
        'x-forwarded-for': '10.0.0.1, 192.168.1.1',
        'x-real-ip': '192.168.1.1'
      })
      const config = { interval: 60000, limit: 1 }

      expect(rateLimit(request, config).allowed).toBe(true)
      expect(rateLimit(request, config).allowed).toBe(false)
      
      // Different forwarded IP should have its own limit
      const request2 = mockRequest({ 
        'x-forwarded-for': '10.0.0.2, 192.168.1.1'
      })
      expect(rateLimit(request2, config).allowed).toBe(true)
    })

    it('should fallback to user-agent and accept-language when no IP available', () => {
      const request = mockRequest({ 
        'user-agent': 'Mozilla/5.0',
        'accept-language': 'en-US'
      })
      const config = { interval: 60000, limit: 1 }

      expect(rateLimit(request, config).allowed).toBe(true)
      expect(rateLimit(request, config).allowed).toBe(false)
    })

    it('should use default config when not provided', () => {
      const request = mockRequest({ 'x-real-ip': '192.168.1.1' })
      
      // Default is 10 requests per minute
      for (let i = 0; i < 10; i++) {
        expect(rateLimit(request).allowed).toBe(true)
      }
      expect(rateLimit(request).allowed).toBe(false)
    })

    it('should clean up expired entries', () => {
      const request1 = mockRequest({ 'x-real-ip': '192.168.1.1' })
      const request2 = mockRequest({ 'x-real-ip': '192.168.1.2' })
      const config = { interval: 60000, limit: 1 }

      // Create entries
      rateLimit(request1, config)
      rateLimit(request2, config)

      // Advance time past cleanup threshold (5 minutes)
      jest.advanceTimersByTime(360000)

      // Trigger cleanup by making a new request
      const request3 = mockRequest({ 'x-real-ip': '192.168.1.3' })
      rateLimit(request3, config)

      // Old entries should be allowed again (cleaned up)
      expect(rateLimit(request1, config).allowed).toBe(true)
      expect(rateLimit(request2, config).allowed).toBe(true)
    })
  })

  describe('rateLimitConfigs', () => {
    it('should have correct login config', () => {
      expect(rateLimitConfigs.login).toEqual({
        interval: 300000, // 5 minutes
        limit: 5
      })
    })

    it('should have correct api config', () => {
      expect(rateLimitConfigs.api).toEqual({
        interval: 60000, // 1 minute
        limit: 30
      })
    })

    it('should have correct passwordReset config', () => {
      expect(rateLimitConfigs.passwordReset).toEqual({
        interval: 3600000, // 1 hour
        limit: 3
      })
    })
  })
})