/// <reference types="vitest" />
/// <reference types="vite/client" />

import '@testing-library/jest-dom/vitest'

// Extend Vitest's expect interface with jest-dom matchers
declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T> {}
  interface AsymmetricMatchersContaining extends jest.AsymmetricMatchers {}
}

// Global type declarations for test environment
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      CI?: string
    }
  }
}