process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.USE_SUPABASE = 'true'

// Add globals for jsdom environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, options) {
      this.url = url
      this.options = options
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, options) {
      this.body = body
      this.options = options
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.init = init
    }
  }
}

if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}