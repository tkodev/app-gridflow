'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'

// 2. types
type UsePostShareArgs = {
  post: Post
  profile: Profile
}

type UsePostShareResult = {
  handleShare: () => Promise<void>
  isSharing: boolean
  /** True when the browser's Web Share API is available (typically iOS/Android). */
  canShare: boolean
}

// 3. hook
export function usePostShare({ post, profile }: UsePostShareArgs): UsePostShareResult {
  const [isSharing, setIsSharing] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const handleShare = useCallback(async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return

    setIsSharing(true)
    try {
      const files = await Promise.all(
        post.media.map(async (item) => {
          const res = await fetch(item.media_url)
          const blob = await res.blob()
          const ext =
            blob.type.split('/')[1]?.replace('jpeg', 'jpg') ??
            (item.media_type === 'video' ? 'mp4' : 'jpg')
          return new File([blob], `${item.id}.${ext}`, { type: blob.type })
        })
      )

      const shareDataWithFiles: ShareData = {
        title: profile.username,
        ...(post.caption ? { text: post.caption } : {}),
        ...(files.length > 0 ? { files } : {})
      }

      const supportsFiles =
        files.length > 0 &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare(shareDataWithFiles)

      if (supportsFiles) {
        await navigator.share(shareDataWithFiles)
      } else {
        await navigator.share({
          title: profile.username,
          ...(post.caption ? { text: post.caption } : {})
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    } finally {
      setIsSharing(false)
    }
  }, [post, profile])

  return { handleShare, isSharing, canShare }
}
