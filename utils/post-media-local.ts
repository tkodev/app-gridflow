import type { LocalMediaItem, PostMedia } from '@/types/post'
import { MAX_POST_MEDIA_ITEMS } from '@/constants/posts'

/** Map server media rows to local form items (edit mode). */
export function mapPostMediaToLocalItems(media: PostMedia[]): LocalMediaItem[] {
  return media.slice(0, MAX_POST_MEDIA_ITEMS).map((m) => ({
    id: m.id,
    url: m.media_url,
    type: m.media_type,
    isNew: false
  }))
}
