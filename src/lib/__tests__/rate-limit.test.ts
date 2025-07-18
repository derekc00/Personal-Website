import { NextRequest } from 'next/server'
import { rateLimit, rateLimitConfigs, clearRateLimitStore } from '../rate-limit'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Rate Limit', () => {
  let requestCounter = 0;
  
  const mockRequest = (headers: Record<string, string> = {}) => {
    // Ensure each test gets unique request identifiers to avoid interference
    const uniqueId = ++requestCounter;
    const defaultHeaders = {
      'x-real-ip': `192.168.1.${uniqueId}`,
      ...headers
    };
    
    return {
      headers: {
        get: (key: string) => defaultHeaders[key] || null
      }
    } as NextRequest
  }

  beforeEach(() => {
    requestCounter = 0;
    vi.clearAllMocks()
    vi.useFakeTimers()
    clearRateLimitStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rateLimit', () => {
    it('should allow requests within the limit', () => {
      const fixedIp = '192.168.1.100';
      const config = { interval: 60000, limit: 3 }

      // First 3 requests should be allowed
      for (let i = 0; i < 3; i++) {
        const request = mockRequest({ 'x-real-ip': fixedIp })
        const result = rateLimit(request, config)
        expect(result.allowed).toBe(true)
      }
    })

    it('should block requests exceeding the limit', () => {
      const fixedIp = '192.168.1.101';
      const config = { interval: 60000, limit: 2 }

      // First 2 requests allowed
      const request1 = mockRequest({ 'x-real-ip': fixedIp })
      const request2 = mockRequest({ 'x-real-ip': fixedIp })
      const request3 = mockRequest({ 'x-real-ip': fixedIp })
      
      expect(rateLimit(request1, config).allowed).toBe(true)
      expect(rateLimit(request2, config).allowed).toBe(true)
      
      // Third request blocked
      const result = rateLimit(request3, config)
      expect(result.allowed).toBe(false)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should reset the count after the interval', () => {
      const fixedIp = '192.168.1.102';
      const config = { interval: 60000, limit: 1 }

      // First request allowed
      const request1 = mockRequest({ 'x-real-ip': fixedIp })
      expect(rateLimit(request1, config).allowed).toBe(true)
      
      // Second request blocked
      const request2 = mockRequest({ 'x-real-ip': fixedIp })
      expect(rateLimit(request2, config).allowed).toBe(false)

      // Advance time past the interval
      vi.advanceTimersByTime(61000)

      // Request should be allowed again
      const request3 = mockRequest({ 'x-real-ip': fixedIp })
      expect(rateLimit(request3, config).allowed).toBe(true)
    })

    it('should track different IPs separately', () => {
      const request1 = mockRequest({ 'x-real-ip': '192.168.1.103' })
      const request2 = mockRequest({ 'x-real-ip': '192.168.1.104' })
      const config = { interval: 60000, limit: 1 }

      // Both IPs should get their own limit
      expect(rateLimit(request1, config).allowed).toBe(true)
      expect(rateLimit(request2, config).allowed).toBe(true)
      
      // Each IP blocked on second request
      const request1Again = mockRequest({ 'x-real-ip': '192.168.1.103' })
      const request2Again = mockRequest({ 'x-real-ip': '192.168.1.104' })
      expect(rateLimit(request1Again, config).allowed).toBe(false)
      expect(rateLimit(request2Again, config).allowed).toBe(false)
    })

    it('should use x-forwarded-for header when available', () => {
      const request = mockRequest({ 
        'x-forwarded-for': '10.0.0.105, 192.168.1.1',
        'x-real-ip': '192.168.1.1'
      })
      const config = { interval: 60000, limit: 1 }

      expect(rateLimit(request, config).allowed).toBe(true)
      const request2 = mockRequest({ 
        'x-forwarded-for': '10.0.0.105, 192.168.1.1',
        'x-real-ip': '192.168.1.1'
      })
      expect(rateLimit(request2, config).allowed).toBe(false)
      
      // Different forwarded IP should have its own limit
      const request3 = mockRequest({ 
        'x-forwarded-for': '10.0.0.106, 192.168.1.1'
      })
      expect(rateLimit(request3, config).allowed).toBe(true)
    })

    it('should fallback to user-agent and accept-language when no IP available', () => {
      const request = mockRequest({ 
        'user-agent': 'Mozilla/5.0-TestAgent',
        'accept-language': 'en-US'
      })
      const config = { interval: 60000, limit: 1 }

      // Remove the x-real-ip that is added by default
      request.headers.get = (key: string) => {
        if (key === 'x-real-ip' || key === 'x-forwarded-for') return null;
        if (key === 'user-agent') return 'Mozilla/5.0-TestAgent';
        if (key === 'accept-language') return 'en-US';
        return null;
      };

      expect(rateLimit(request, config).allowed).toBe(true)
      const request2 = mockRequest({ 
        'user-agent': 'Mozilla/5.0-TestAgent',
        'accept-language': 'en-US'
      })
      request2.headers.get = (key: string) => {
        if (key === 'x-real-ip' || key === 'x-forwarded-for') return null;
        if (key === 'user-agent') return 'Mozilla/5.0-TestAgent';
        if (key === 'accept-language') return 'en-US';
        return null;
      };
      expect(rateLimit(request2, config).allowed).toBe(false)
    })

    it('should use default config when not provided', () => {
      const fixedIp = '192.168.1.107';
      
      // Default is 10 requests per minute
      for (let i = 0; i < 10; i++) {
        const request = mockRequest({ 'x-real-ip': fixedIp })
        expect(rateLimit(request).allowed).toBe(true)
      }
      const finalRequest = mockRequest({ 'x-real-ip': fixedIp })
      expect(rateLimit(finalRequest).allowed).toBe(false)
    })

    it('should clean up expired entries', () => {
      const request1 = mockRequest({ 'x-real-ip': '192.168.1.108' })
      const request2 = mockRequest({ 'x-real-ip': '192.168.1.109' })
      const config = { interval: 60000, limit: 1 }

      // Create entries
      rateLimit(request1, config)
      rateLimit(request2, config)

      // Advance time past cleanup threshold (more than interval)
      vi.advanceTimersByTime(120000)

      // Old entries should be allowed again (expired)
      const request1New = mockRequest({ 'x-real-ip': '192.168.1.108' })
      const request2New = mockRequest({ 'x-real-ip': '192.168.1.109' })
      expect(rateLimit(request1New, config).allowed).toBe(true)
      expect(rateLimit(request2New, config).allowed).toBe(true)
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