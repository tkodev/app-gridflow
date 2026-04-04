import { pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { posts } from './posts'
import { profiles } from './profiles'

const tagSets = pgTable('tag_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  tags: text('tags').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

const postTagSets = pgTable(
  'post_tag_sets',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagSetId: uuid('tag_set_id')
      .notNull()
      .references(() => tagSets.id, { onDelete: 'cascade' })
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagSetId] })]
)

export { postTagSets, tagSets }
