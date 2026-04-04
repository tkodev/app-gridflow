'use client'

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
import type { LocalMediaItem } from '@/types/post'
import type { Post } from '@/types/post'
import type { DragEndEvent } from '@dnd-kit/core'
import { maxPostMediaFileBytes, maxPostMediaItems } from '@/constants/storage'
import { reorderItemsFromDragEnd } from '@/utils/dnd-kit'
import { revokeNewBlobUrls } from '@/utils/local-media'
import { mapPostMediaToLocalItems } from '@/utils/post-media-local'

type UseMediaEditArgs = {
  post: Post | null | undefined
  open: boolean
  setError: Dispatch<SetStateAction<string | null>>
}

type UseMediaEditResult = {
  mediaItems: LocalMediaItem[]
  fileInputRef: RefObject<HTMLInputElement | null>
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  /** Add image/video files (e.g. from drag-and-drop). Same validation as the file input. */
  addMediaFiles: (files: File[]) => void
  handleRemoveMedia: (id: string) => void
  handleDragEnd: (event: DragEndEvent, options: { disabled: boolean }) => void
  /** Call when closing the dialog to release blob URLs for unsaved uploads. */
  revokePendingBlobUrls: () => void
}

function useMediaEdit({ post, open, setError }: UseMediaEditArgs): UseMediaEditResult {
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

  const addMediaFiles = useCallback(
    (files: File[]) => {
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

        if (file.size > maxPostMediaFileBytes) {
          setError('Files must be less than 50MB')
          continue
        }

        validMeta.push({
          file,
          type: isVideo ? 'video' : 'image'
        })
      }

      setMediaItems((prev) => {
        const remaining = maxPostMediaItems - prev.length
        if (remaining <= 0) {
          if (validMeta.length > 0) {
            setError(`Maximum ${maxPostMediaItems} media items per post`)
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
          setError(`Maximum ${maxPostMediaItems} media items per post`)
        } else if (toAdd.length > 0) {
          setError(null)
        }

        return toAdd.length > 0 ? [...prev, ...toAdd] : prev
      })
    },
    [setError]
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      addMediaFiles(files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [addMediaFiles]
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
    setMediaItems((items) => {
      const next = reorderItemsFromDragEnd(items, event, (i) => i.id)
      return next ?? items
    })
  }, [])

  const revokePendingBlobUrls = useCallback(() => {
    revokeNewBlobUrls(mediaItems)
  }, [mediaItems])

  return {
    mediaItems,
    fileInputRef,
    handleFileChange,
    addMediaFiles,
    handleRemoveMedia,
    handleDragEnd,
    revokePendingBlobUrls
  }
}

export { useMediaEdit }
