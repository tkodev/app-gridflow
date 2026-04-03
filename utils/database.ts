import { drizzle, type PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import { type ExtractTablesWithRelations, sql } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import postgres from 'postgres'

/**
 * Direct PostgreSQL connection via postgres.js / Supavisor.
 * Disable prefetch — not supported for Transaction pool mode.
 */
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { prepare: false })

const db = drizzle(client)

type DrizzleTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>

type QueryInTransaction<T> = (tx: DrizzleTransaction) => Promise<T>

/**
 * Run a Drizzle query inside a transaction that impersonates the given
 * Supabase user — so existing RLS policies keep working.
 *
 * Follows the pattern from the drizzleorm-supabase-nextjs boilerplate:
 * sets `request.jwt.claim.sub` (used by Supabase's `auth.uid()`) and
 * also sets `role` to `authenticated` so RLS policies that check the
 * role grant see the correct role.
 */
async function rlsQuery<T>(userId: string, txFunc: QueryInTransaction<T>): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('request.jwt.claim.sub', ${userId}, TRUE)`
    )
    await tx.execute(sql`SET LOCAL ROLE authenticated`)
    return await txFunc(tx)
  })
}

export type { DrizzleTransaction }
export { db, rlsQuery }
