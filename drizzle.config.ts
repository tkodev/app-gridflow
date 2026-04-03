import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  schema: './schema/*',
  out: './supabase/migrations'
} satisfies Config
