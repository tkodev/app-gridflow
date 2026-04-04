import type { postMedia, posts } from '@/schemas/posts'
import type { Post, PostMedia } from '@/types/post'

function postMediaRowToPostMedia(row: typeof postMedia.$inferSelect): PostMedia {
  return {
    id: row.id,
    post_id: row.postId,
    media_url: row.mediaUrl,
    media_type: row.mediaType,
    position: row.position,
    created_at: row.createdAt.toISOString()
  }
}

function postRowToPost(row: typeof posts.$inferSelect, media: PostMedia[]): Post {
  return {
    id: row.id,
    profile_id: row.profileId,
    caption: row.caption,
    subtitle: row.subtitle,
    tagline: row.tagline,
    grid_position: row.gridPosition,
    status: row.status,
    scheduled_at: row.scheduledAt?.toISOString() ?? null,
    published_at: row.publishedAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    media
  }
}

export { postMediaRowToPostMedia, postRowToPost }
