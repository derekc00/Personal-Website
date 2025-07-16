import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // UI Component Tests Project
  {
    extends: './vitest.config.mjs',
    test: {
      include: [
        'src/components/**/__tests__/**/*.(ts|tsx)',
        'src/components/**/?(*.)+(spec|test).(ts|tsx)',
        'src/app/**/__tests__/**/*.(ts|tsx)', 
        'src/app/**/?(*.)+(spec|test).(ts|tsx)',
      ],
      name: 'ui',
      environment: 'jsdom',
    },
  },
  
  // API Tests Project  
  {
    extends: './vitest.config.mjs',
    test: {
      include: [
        'src/app/api/**/__tests__/**/*.(ts|tsx)',
        'src/app/api/**/?(*.)+(spec|test).(ts|tsx)',
        'src/lib/api/**/__tests__/**/*.(ts|tsx)',
        'src/lib/api/**/?(*.)+(spec|test).(ts|tsx)',
        'src/utils/supabase/**/__tests__/**/*.(ts|tsx)',
        'src/utils/supabase/**/?(*.)+(spec|test).(ts|tsx)',
      ],
      name: 'api',
      environment: 'node',
    },
  },
])