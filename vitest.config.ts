import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Global test configuration
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    
    // Environment configuration
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        // Add any JSDOM-specific options here if needed
        resources: 'usable',
      },
    },
    
    // Setup files
    setupFiles: ['./config/vitest.setup.base.ts'],
    
    // Test file patterns
    include: [
      'src/**/__tests__/**/*.(ts|tsx)',
      'src/**/?(*.)+(spec|test).(ts|tsx)',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.(ts|tsx)'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.tsx',
        'src/**/test/**',
        'src/**/mocks/**',
        'src/**/__tests__/**',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    
    // Pool configuration for parallel test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter configuration
    reporters: process.env.CI ? ['default', 'github-actions'] : ['default'],
    
    // Project-based environment configuration
    projects: [
      {
        name: 'ui',
        testMatch: [
          'src/**/__tests__/**/*.test.(ts|tsx)',
          'src/**/*.spec.(ts|tsx)',
          '!src/**/api/**/__tests__/**/*.test.(ts|tsx)',
          '!src/lib/api/**/*.test.(ts|tsx)',
        ],
        environment: 'jsdom',
      },
      {
        name: 'api', 
        testMatch: [
          'src/**/api/**/__tests__/**/*.test.(ts|tsx)',
          'src/lib/api/**/*.test.(ts|tsx)',
        ],
        environment: 'node',
      },
    ],
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  
  // ESBuild options for better compatibility
  esbuild: {
    target: 'es2020',
    jsx: 'automatic',
  },
  
  // Optimize deps configuration
  optimizeDeps: {
    include: ['react', 'react-dom', '@testing-library/react'],
  },
})