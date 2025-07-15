import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom'

// Base Vitest setup - shared between all test environments
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.USE_SUPABASE = 'true'

// Add TextEncoder/TextDecoder for Node environment
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Add TransformStream polyfill
if (typeof global.TransformStream === 'undefined') {
  const { TransformStream } = require('stream/web')
  global.TransformStream = TransformStream
}

// Add BroadcastChannel polyfill
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    name: string
    
    constructor(name: string) {
      this.name = name
    }
    
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  } as any
}

// Add fetch if it doesn't exist
if (typeof global.fetch === 'undefined') {
  global.fetch = vi.fn()
}

// Environment-specific setup for jsdom
// Import testing library setup for component tests
import('@testing-library/jest-dom')

if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  // Add Request, Response, and Headers polyfills for jsdom environment
  if (typeof global.Request === 'undefined') {
    global.Request = class Request {
      url: string
      method: string
      headers: Headers
      body: any
      
      constructor(url: string, init?: RequestInit) {
        this.url = url
        this.method = init?.method || 'GET'
        this.headers = new Headers(init?.headers)
        this.body = init?.body
      }
    } as any
  }

  if (typeof global.Response === 'undefined') {
    global.Response = class Response {
      body: any
      status: number
      statusText: string
      headers: Headers
      ok: boolean
      
      constructor(body?: any, init?: ResponseInit) {
        this.body = body
        this.status = init?.status || 200
        this.statusText = init?.statusText || 'OK'
        this.headers = new Headers(init?.headers)
        this.ok = this.status >= 200 && this.status < 300
      }
      
      async json() {
        return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
      }
      
      async text() {
        return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
      }
    } as any
  }

  if (typeof global.Headers === 'undefined') {
    global.Headers = class Headers {
      private _headers: Record<string, string> = {}
      
      constructor(init?: HeadersInit) {
        if (init) {
          Object.entries(init).forEach(([key, value]) => {
            this._headers[key.toLowerCase()] = value as string
          })
        }
      }
      
      get(name: string) {
        return this._headers[name.toLowerCase()]
      }
      
      set(name: string, value: string) {
        this._headers[name.toLowerCase()] = value
      }
    } as any
  }
  
  // Import testing library setup removed from here to avoid duplication
  
  // Console methods are not mocked globally to allow test-specific spies
  // Individual tests should create their own console spies as needed
}

// MSW Setup
import { server } from '../src/test/mocks/server'

// For Node.js environment, we need to enable fetch interceptor
if (typeof window === 'undefined') {
  // Add fetch polyfill if it doesn't exist
  if (typeof globalThis.fetch === 'undefined') {
    try {
      const { fetch, Headers, Request, Response } = require('undici')
      globalThis.fetch = fetch
      globalThis.Headers = Headers
      globalThis.Request = Request
      globalThis.Response = Response
    } catch (error) {
      // Fallback if undici is not available
      console.warn('undici not available, using vitest fetch mock')
    }
  }
}

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ 
    onUnhandledRequest: 'warn'
  })
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers()
  
  // Only run cleanup for browser environment (component tests)
  if (typeof window !== 'undefined') {
    const { cleanup } = require('@testing-library/react')
    cleanup()
    
    // Clear all mocks
    vi.clearAllMocks()
    vi.resetModules()
    
    // Clean DOM
    if (typeof document !== 'undefined') {
      document.body.innerHTML = ''
    }
    
    // Clear timers
    vi.clearAllTimers()
  }
})

// Clean up after the tests are finished
afterAll(() => server.close())