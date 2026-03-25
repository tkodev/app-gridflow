import { tkodevConfig } from '@tkodev/config-eslint-next'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  ...tkodevConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'swr',
              message: 'Use TanStack Query instead (see docs/tech.md).'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn'
    }
  }
])
