// Polyfills for Jest test environment to support MSW
const { TextEncoder, TextDecoder } = require('util')

// Set up TextEncoder/TextDecoder first before undici import
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Now import undici 
const { fetch, Headers, Request, Response } = require('undici')

// Web API polyfills
global.fetch = fetch
global.Headers = Headers
global.Request = Request
global.Response = Response