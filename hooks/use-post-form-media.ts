'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type RefObject,
  type SetStateAction
} from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { LocalMediaItem } from '@/types/post'
import type { Post } from '@/types/post'
import { MAX_POST_MEDIA_FILE_BYTES, MAX_POST_MEDIA_ITEMS } from '@/constants/posts'
import { revokeNewBlobUrls } from '@/utils/local-media'
import { mapPostMediaToLocalItems } from '@/utils/post-media-local'

type UsePostFormMediaArgs = {
  post: Post | null | undefined
  open: boolean
  setError: Dispatch<SetStateAction<string | null>>
}

type UsePostFormMediaResult = {
  mediaItems: LocalMediaItem[]
  fileInputRef: RefObject<HTMLInputElement | null>
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleRemoveMedia: (id: string) => void
  handleDragEnd: (event: DragEndEvent, options: { disabled: boolean }) => void
  /** Call when closing the dialog to release blob URLs for unsaved uploads. */
  revokePendingBlobUrls: () => void
}

export function usePostFormMedia({
  post,
  open,
  setError
}: UsePostFormMediaArgs): UsePostFormMediaResult {
  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (post) {
      startTransition(() => {
        if (post.media.length > 0) {
          setMediaItems(mapPostMediaToLocalItems(post.media))
        } else {
          setMediaItems([])
        }
        setError(null)
      })
    } else {
      startTransition(() => {
        setMediaItems([])
        setError(null)
      })
    }
  }, [post, open, setError])

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      type ValidMeta = { file: File; type: 'image' | 'video' }
      const validMeta: ValidMeta[] = []

      for (const file of files) {
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        if (!isImage && !isVideo) {
          setError('Only image and video files are allowed')
          continue
        }

        if (file.size > MAX_POST_MEDIA_FILE_BYTES) {
          setError('Files must be less than 50MB')
          continue
        }

        validMeta.push({
          file,
          type: isVideo ? 'video' : 'image'
        })
      }

      setMediaItems((prev) => {
        const remaining = MAX_POST_MEDIA_ITEMS - prev.length
        if (remaining <= 0) {
          if (validMeta.length > 0) {
            setError(`Maximum ${MAX_POST_MEDIA_ITEMS} media items per post`)
          }
          return prev
        }

        const toAddMeta = validMeta.slice(0, remaining)
        const toAdd: LocalMediaItem[] = toAddMeta.map(({ file, type }) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          type,
          isNew: true
        }))

        if (validMeta.length > toAddMeta.length) {
          setError(`Maximum ${MAX_POST_MEDIA_ITEMS} media items per post`)
        } else if (toAdd.length > 0) {
          setError(null)
        }

        return toAdd.length > 0 ? [...prev, ...toAdd] : prev
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [setError]
  )

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.id === id)
      if (item?.isNew && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url)
      }
      return prev.filter((m) => m.id !== id)
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent, options: { disabled: boolean }) => {
    if (options.disabled) return
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const revokePendingBlobUrls = useCallback(() => {
    revokeNewBlobUrls(mediaItems)
  }, [mediaItems])

  return {
    mediaItems,
    fileInputRef,
    handleFileChange,
    handleRemoveMedia,
    handleDragEnd,
    revokePendingBlobUrls
  }
}
