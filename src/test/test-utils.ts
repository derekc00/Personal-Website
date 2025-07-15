import { cleanup } from '@testing-library/react'
import { vi } from 'vitest'

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
 * Mock Next.js router for tests
 */
export const mockRouter = () => {
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
  
  return {
    mockPush,
    mockReplace,
    mockBack,
    mockForward,
    mockRefresh,
  }
}