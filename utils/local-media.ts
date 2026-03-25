import type { LocalMediaItem } from '@/types/post'

/** Next/Image cannot optimize blob: or data: URLs — use this for `unoptimized`. */
function isLocalImageUrlUnoptimized(url: string): boolean {
  return url.startsWith('blob:') || url.startsWith('data:')
}

/** Revoke object URLs for newly added local media (blob URLs). */
function revokeNewBlobUrls(items: LocalMediaItem[]): void {
  for (const item of items) {
    if (item.isNew && item.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url)
    }
  }
}

export { isLocalImageUrlUnoptimized, revokeNewBlobUrls }
