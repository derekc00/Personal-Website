// Minimal Jest setup for testing without MSW
import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

// Mock console methods to capture logs for testing
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};