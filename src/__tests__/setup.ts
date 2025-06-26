// Jest setup file for global test configuration
import { jest } from '@jest/globals';

// Mock console methods to capture logs for testing
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// This file exists solely for Jest setup - no tests needed