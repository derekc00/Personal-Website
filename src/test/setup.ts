import '@testing-library/jest-dom'
import { jest, beforeAll, afterEach, afterAll } from '@jest/globals'
import { server } from './mocks/server'

// Mock console methods to capture logs for testing
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())