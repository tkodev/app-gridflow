import { drizzle } from 'drizzle-orm/postgres-js'
import { reset } from 'drizzle-seed'
import postgres from 'postgres'
import { collectionMedia, collections } from '@/schemas/collections'
import { postMedia, posts } from '@/schemas/posts'
import { profiles } from '@/schemas/profiles'
import { customers, subscriptions } from '@/schemas/subscriptions'
import { postTagSets, tagSets } from '@/schemas/tag-sets'
import 'dotenv/config'

/** All app tables passed to drizzle-seed `reset` (FK order handled by the library). */
const schema = {
  customers,
  subscriptions,
  profiles,
  posts,
  postMedia,
  collections,
  collectionMedia,
  tagSets,
  postTagSets
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }

  const client = postgres(url, { prepare: false, max: 1 })
  const db = drizzle(client)

  try {
    await reset(db, schema)
    console.log('Database reset complete.')
  } finally {
    await client.end({ timeout: 5 })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
