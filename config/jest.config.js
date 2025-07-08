/**
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  rootDir: '../',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx)', 
    '**/?(*.)+(spec|test).(ts|tsx)',
    '!**/api/**/__tests__/**/*',
    '!**/api/**/*.test.*',
    '!**/api/**/*.spec.*'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        allowJs: true,
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/config/jest.setup.env.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(isows|@supabase|jose)/)'
  ],
};