import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

const collectionMedia = pgTable('collection_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectionId: uuid('collection_id')
    .notNull()
    .references(() => collections.id, { onDelete: 'cascade' }),
  mediaUrl: text('media_url').notNull(),
  mediaType: text('media_type', { enum: ['image', 'video'] }).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export { collectionMedia, collections }
