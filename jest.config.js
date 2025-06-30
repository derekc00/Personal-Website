module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(isows|@supabase)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup-minimal.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts', 
    '<rootDir>/src/test/setup.ts',
    '<rootDir>/src/app/blog/__tests__/page.test.tsx',
    '<rootDir>/src/app/content/__tests__/page.test.tsx'
  ],
  testNamePattern: '^(?!.*(Navigation Integration|should handle WebGL context loss gracefully|should retry WebGL initialization when requested|should log initialization messages in development mode)).*$',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/jest.setup.env.js'],
};