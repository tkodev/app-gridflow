import type { Post } from '@/types/post'

/** Human-readable label for a post card (scheduled vs created). */
function getPostDateLabel(post: Pick<Post, 'scheduled_at' | 'created_at'>): string {
  if (post.scheduled_at) {
    return `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}`
  }
  return new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  })
}

export { getPostDateLabel }
