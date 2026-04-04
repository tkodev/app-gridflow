import type { profiles } from '@/schemas/profiles'
import type { Profile } from '@/types/profile'

/** Map a Drizzle `profiles` row to the app `Profile` shape (API / server). */
function profileRowToProfile(row: typeof profiles.$inferSelect): Profile {
  return {
    id: row.id,
    user_id: row.userId,
    username: row.username,
    display_name: row.displayName,
    bio: row.bio,
    avatar_url: row.avatarUrl,
    grid_ratio: row.gridRatio,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString()
  }
}

export { profileRowToProfile }
