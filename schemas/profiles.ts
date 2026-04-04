import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  username: text('username').unique().notNull(),
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  gridRatio: text('grid_ratio', { enum: ['square', 'portrait'] })
    .default('square')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

export { profiles }
