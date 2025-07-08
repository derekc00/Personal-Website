/**
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../',
  roots: ['<rootDir>/src'],
  testMatch: ['**/api/**/__tests__/**/*.test.(ts|tsx)', '**/api/**/*.spec.(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/api/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
  ],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/config/jest.setup.api.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(isows|@supabase|jose)/)'
  ],
};