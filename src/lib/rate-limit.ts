import { NextRequest } from 'next/server'

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number    // Maximum requests allowed in the interval
}

/**
 * In-memory store for rate limit tracking
 * In production, consider using Redis or another distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Predefined rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  login: { interval: 300000, limit: 5 },        // 5 attempts per 5 minutes
  api: { interval: 60000, limit: 30 },          // 30 requests per minute
  passwordReset: { interval: 3600000, limit: 3 } // 3 attempts per hour
} as const

/**
 * Cleans up expired entries from the store to prevent memory leaks
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Gets a unique identifier for the request
 * Uses IP address if available, falls back to user agent + accept language
 */
function getRequestIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to a combination of headers for identification
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const acceptLanguage = request.headers.get('accept-language') || 'unknown'
  return `fallback-${userAgent}-${acceptLanguage}`.substring(0, 100)
}

/**
 * Implements rate limiting for API endpoints
 * 
 * @param request - The incoming Next.js request
 * @param config - Rate limit configuration (defaults to 10 requests per minute)
 * @returns Object with allowed status and reset time
 */
export function rateLimit(
  request: NextRequest, 
  config: RateLimitConfig = { interval: 60000, limit: 10 }
): { allowed: boolean; resetTime: number } {
  const identifier = getRequestIdentifier(request)
  const now = Date.now()
  
  // Clean up expired entries periodically (every 100th request)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries()
  }
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier)
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + config.interval
    }
  }
  
  // Increment counter
  entry.count++
  rateLimitStore.set(identifier, entry)
  
  // Check if limit exceeded
  const allowed = entry.count <= config.limit
  
  return {
    allowed,
    resetTime: entry.resetTime
  }
}

/**
 * Clear the rate limit store - for testing purposes only
 */
export function clearRateLimitStore() {
  if (process.env.NODE_ENV?.toLowerCase() === 'test') {
    rateLimitStore.clear()
  }
}