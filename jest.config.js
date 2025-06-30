/**
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts', '<rootDir>/src/test/setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/jest.setup.env.js'],
};