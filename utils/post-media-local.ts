import type { LocalMediaItem, PostMedia } from '@/types/post'
import { maxPostMediaItems } from '@/constants/storage'

/** Map server media rows to local form items (edit mode). */
function mapPostMediaToLocalItems(media: PostMedia[]): LocalMediaItem[] {
  return media.slice(0, maxPostMediaItems).map((m) => ({
    id: m.id,
    url: m.media_url,
    type: m.media_type,
    isNew: false
  }))
}

export { mapPostMediaToLocalItems }
