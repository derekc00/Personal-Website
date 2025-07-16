import { cleanup } from '@testing-library/react'
import { vi } from 'vitest'

// Mock Next.js navigation at module level for proper hoisting
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockBack = vi.fn()
const mockForward = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

/**
 * Comprehensive test cleanup utility
 * Call this in afterEach hooks to ensure proper test isolation
 */
export const cleanupTest = () => {
  // Clean up React Testing Library components
  cleanup()
  
  // Clear all mock implementations and call history
  vi.clearAllMocks()
  
  // Reset modules to clear module-level state
  vi.resetModules()
  
  // Clear the document body to prevent DOM pollution
  if (typeof document !== 'undefined') {
    document.body.innerHTML = ''
  }
  
  // Clear any timers
  vi.clearAllTimers()
  vi.useRealTimers()
}

/**
 * Setup console spy for testing
 * Returns a cleanup function to restore console
 */
export const setupConsoleSpy = (method: 'log' | 'warn' | 'error' = 'log') => {
  const spy = vi.spyOn(console, method).mockImplementation(() => {})
  
  const cleanup = () => {
    spy.mockRestore()
  }
  
  return { spy, cleanup }
}

/**
 * Get mocked Next.js router functions for tests
 * Call this after importing test-utils to access the mock functions
 */
export const getMockRouter = () => {
  return {
    mockPush,
    mockReplace,
    mockBack,
    mockForward,
    mockRefresh,
  }
}