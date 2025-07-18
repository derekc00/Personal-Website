# Vitest Migration Guide

This guide helps you transition from Jest to Vitest with the new configuration.

## Configuration Overview

The new Vitest configuration replaces the dual Jest setup with a unified configuration that supports both UI and API testing.

### Main Configuration File: `vitest.config.ts`

- **React Plugin**: Automatically handles JSX transformation and React optimizations
- **Environment Matching**: Uses `environmentMatchGlobs` to automatically select the right environment (jsdom for UI, node for API)
- **Coverage**: Configured with v8 provider and 80% thresholds
- **Global Jest API**: Enabled via `globals: true` for compatibility

### Setup Files

1. **`config/vitest.setup.base.ts`**: Combines all Jest setup files into one:
   - Environment variables
   - Polyfills for both node and jsdom environments
   - MSW server initialization
   - Testing library imports

### Test Scripts

- `npm test` - Run all tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:coverage` - Run with coverage report
- `npm run test:api` - Run only API tests
- `npm run test:components` - Run only component tests
- `npm run test:all` - Run all tests using workspace configuration

## Key Differences from Jest

### 1. Import Changes

```typescript
// Jest
import { jest } from '@jest/globals'

// Vitest
import { vi } from 'vitest'
```

### 2. Mock Functions

```typescript
// Jest
jest.fn()
jest.spyOn()
jest.mock()

// Vitest
vi.fn()
vi.spyOn()
vi.mock()
```

### 3. Timer Functions

```typescript
// Jest
jest.useFakeTimers()
jest.runAllTimers()

// Vitest
vi.useFakeTimers()
vi.runAllTimers()
```

### 4. Module Mocking

```typescript
// Jest
jest.mock('./module', () => ({
  default: jest.fn()
}))

// Vitest
vi.mock('./module', () => ({
  default: vi.fn()
}))
```

## Benefits of Vitest

1. **Faster execution**: Uses Vite's transformation pipeline
2. **Better TypeScript support**: Native ESM support
3. **Unified configuration**: Single config file for all test types
4. **Better watch mode**: Only re-runs affected tests
5. **Built-in UI**: Interactive test runner UI
6. **Compatible API**: Most Jest code works with minimal changes

## Migration Steps

1. Update test files to use `vi` instead of `jest`
2. Update any custom matchers or extensions
3. Remove old Jest configuration files when ready
4. Update CI configuration to use Vitest commands

## Troubleshooting

### Common Issues

1. **Module resolution errors**: Check that path aliases are configured in `vitest.config.ts`
2. **Missing globals**: Ensure `globals: true` is set in the config
3. **Environment issues**: Verify `environmentMatchGlobs` patterns match your test files
4. **Coverage not working**: Install `@vitest/coverage-v8` if not already installed

### Environment-Specific Issues

- **API Tests**: Should run in node environment automatically based on file path
- **Component Tests**: Should run in jsdom environment with React Testing Library
- **MSW Issues**: Ensure server is properly initialized in setup file