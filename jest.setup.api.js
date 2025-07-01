process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.USE_SUPABASE = 'true'

// Add TextEncoder/TextDecoder for Node environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Add TransformStream polyfill
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = require('stream/web').TransformStream
}

// Add BroadcastChannel polyfill
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name
    }
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
}

// Add fetch if it doesn't exist
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}