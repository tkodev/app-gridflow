import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  caption: text('caption'),
  subtitle: text('subtitle'),
  tagline: text('tagline'),
  gridPosition: integer('grid_position').default(0).notNull(),
  status: text('status', { enum: ['draft', 'scheduled', 'published'] })
    .default('draft')
    .notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

const postMedia = pgTable('post_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  mediaUrl: text('media_url').notNull(),
  mediaType: text('media_type', { enum: ['image', 'video'] }).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export { postMedia, posts }
