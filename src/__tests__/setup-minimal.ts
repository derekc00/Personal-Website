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

// Mock Next.js environment
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true
});

// This file is required by Jest but doesn't need to contain actual tests
describe('Setup', () => {
  it('should initialize test environment', () => {
    expect(true).toBe(true);
  });
});