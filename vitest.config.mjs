import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  
  // Global test configuration
  test: {
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    
    // Better test isolation
    isolate: true,
    sequence: {
      concurrent: false,
    },
    
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
    
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter configuration
    reporters: process.env.CI ? ['default', 'github-actions'] : ['default'],
  },
  
  // Multi-project configuration (replaces workspace)
  projects: [
    // UI Component Tests Project
    {
      name: 'ui',
      plugins: [react()],
      test: {
        globals: true,
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,
        isolate: true,
        sequence: {
          concurrent: false,
        },
        environment: 'jsdom',
        environmentOptions: {
          jsdom: {
            resources: 'usable',
          },
        },
        setupFiles: ['./config/vitest.setup.base.ts'],
        include: [
          'src/components/**/__tests__/**/*.(ts|tsx)',
          'src/components/**/?(*.)+(spec|test).(ts|tsx)',
          'src/app/**/__tests__/**/*.(ts|tsx)', 
          'src/app/**/?(*.)+(spec|test).(ts|tsx)',
          'src/__tests__/**/*.(ts|tsx)',
          'src/?(*.)+(spec|test).(ts|tsx)',
        ],
        testTimeout: 10000,
        hookTimeout: 10000,
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      esbuild: {
        target: 'es2020',
        jsx: 'automatic',
      },
    },
    
    // API Tests Project  
    {
      name: 'api',
      plugins: [react()],
      test: {
        globals: true,
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,
        isolate: true,
        sequence: {
          concurrent: false,
        },
        environment: 'node',
        setupFiles: ['./config/vitest.setup.base.ts'],
        include: [
          'src/app/api/**/__tests__/**/*.(ts|tsx)',
          'src/app/api/**/?(*.)+(spec|test).(ts|tsx)',
          'src/lib/api/**/__tests__/**/*.(ts|tsx)',
          'src/lib/api/**/?(*.)+(spec|test).(ts|tsx)',
          'src/lib/__tests__/**/*.(ts|tsx)',
          'src/lib/?(*.)+(spec|test).(ts|tsx)',
          'src/utils/supabase/**/__tests__/**/*.(ts|tsx)',
          'src/utils/supabase/**/?(*.)+(spec|test).(ts|tsx)',
        ],
        testTimeout: 10000,
        hookTimeout: 10000,
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      esbuild: {
        target: 'es2020',
        jsx: 'automatic',
      },
    },
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
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