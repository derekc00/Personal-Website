import '@testing-library/jest-dom/vitest'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Set environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.USE_SUPABASE = 'true'

// Add TextEncoder/TextDecoder for Node environment
import { TextEncoder, TextDecoder } from 'util'
Object.assign(global, {
  TextEncoder,
  TextDecoder,
})

// Add TransformStream polyfill
if (typeof global.TransformStream === 'undefined') {
  const { TransformStream } = await import('stream/web')
  global.TransformStream = TransformStream as typeof globalThis.TransformStream
}

// Add BroadcastChannel polyfill
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    name: string
    onmessage: ((event: MessageEvent) => void) | null = null
    onmessageerror: ((event: MessageEvent) => void) | null = null
    
    constructor(name: string) {
      this.name = name
    }
    
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent(event: Event): boolean {
      // In a real implementation, this would dispatch the event
      // For our mock, we just return false to indicate the event was not canceled
      void event; // Mark as used
      return false
    }
  } as unknown as typeof globalThis.BroadcastChannel
}

// Add Request, Response, and Headers polyfills for jsdom environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string
    method: string
    headers: Headers
    body: BodyInit | null | undefined
    
    constructor(url: string, init?: RequestInit) {
      this.url = url
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers)
      this.body = init?.body
    }
  } as unknown as typeof globalThis.Request
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: BodyInit | null | undefined
    status: number
    statusText: string
    headers: Headers
    ok: boolean
    
    constructor(body: BodyInit | null | undefined, init?: ResponseInit) {
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
  } as unknown as typeof globalThis.Response
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
  } as unknown as typeof globalThis.Headers
}

// Add fetch if it doesn't exist
if (typeof global.fetch === 'undefined') {
  global.fetch = vi.fn()
}

// Mock console methods to capture logs for testing
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
}

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())