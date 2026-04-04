import type { Config } from 'drizzle-kit'
import 'dotenv/config'

export default {
  dialect: 'postgresql',
  schema: './schemas/*',
  out: './databases/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
} satisfies Config
