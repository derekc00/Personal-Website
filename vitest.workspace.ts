import { defineWorkspace } from 'vitest/config'

// This workspace configuration allows running UI and API tests separately
// with their specific environments and configurations
export default defineWorkspace([
  {
    // UI/Component tests configuration
    extends: './vitest.config.ts',
    test: {
      name: 'ui',
      include: [
        'src/**/__tests__/**/*.(ts|tsx)',
        'src/**/?(*.)+(spec|test).(ts|tsx)',
      ],
      exclude: [
        'src/**/api/**/__tests__/**/*',
        'src/**/api/**/*.test.*',
        'src/**/api/**/*.spec.*',
        'src/lib/api/**/*.test.*',
        'src/lib/api/**/*.spec.*',
      ],
      environment: 'jsdom',
    },
  },
  {
    // API tests configuration
    extends: './vitest.config.ts',
    test: {
      name: 'api',
      include: [
        'src/**/api/**/__tests__/**/*.test.(ts|tsx)',
        'src/**/api/**/*.spec.(ts|tsx)',
        'src/lib/api/**/*.test.(ts|tsx)',
        'src/lib/api/**/*.spec.(ts|tsx)',
      ],
      environment: 'node',
      coverage: {
        include: ['src/lib/api/**/*.(ts|tsx)', 'src/**/api/**/*.(ts|tsx)'],
      },
    },
  },
])