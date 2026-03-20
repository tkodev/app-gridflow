'use client'

import Image from 'next/image'
import { GripVertical, ImagePlus, Music, Play, Trash2, Upload, X } from 'lucide-react'
import { startTransition, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { LocalMediaItem, Post } from '@/types/post'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MAX_POST_MEDIA_ITEMS } from '@/constants/posts'
import { useDeletePostMutation, useSavePostMutation } from '@/queries/posts'
import { formatSupabaseError } from '@/utils/supabase-errors'
import { cn } from '@/utils/tailwind'

const POST_FORM_ID = 'post-form-dialog-form'

type PostFormFields = {
  caption: string
  subtitle: string
  status: Post['status']
}

type PostFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post?: Post | null // If provided, we're editing; otherwise creating
  profileId: string
  nextPosition?: number
  onSave: (post: Post) => void
  onDelete?: (postId: string) => void
}

const SortableMediaItem = ({
  item,
  onRemove,
  disabled
}: {
  item: LocalMediaItem
  onRemove: () => void
  disabled?: boolean
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group bg-muted relative aspect-square overflow-hidden rounded-lg',
        isDragging && 'z-10 opacity-80 shadow-lg'
      )}
      style={style}
    >
      {item.type === 'video' ? (
        <div className="relative h-full w-full">
          <video className="h-full w-full object-cover" src={item.url} muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
      ) : (
        <Image
          className="object-cover"
          sizes="(max-width: 768px) 28vw, 180px"
          unoptimized={item.url.startsWith('blob:') || item.url.startsWith('data:')}
          alt=""
          src={item.url}
          fill
        />
      )}

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...(disabled ? {} : listeners)}
        className={cn(
          'absolute top-1 left-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100',
          disabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'
        )}
        disabled={disabled}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Remove button */}
      <button
        type="button"
        className="hover:bg-destructive absolute top-1 right-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Type indicator */}
      {item.type === 'video' && (
        <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
          VIDEO
        </span>
      )}
    </div>
  )
}

export const PostFormDialog = ({
  open,
  onOpenChange,
  post,
  profileId,
  nextPosition = 0,
  onSave,
  onDelete
}: PostFormDialogProps) => {
  const formDndId = useId()
  const isEditing = !!post
  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors: fieldErrors }
  } = useForm<PostFormFields>({
    defaultValues: {
      caption: '',
      subtitle: '',
      status: 'draft'
    }
  })

  const status = useWatch({ control, name: 'status' })
  const savePost = useSavePostMutation()
  const deletePost = useDeletePostMutation()
  const isBusy = savePost.isPending || deletePost.isPending
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Initialize form when post changes
  useEffect(() => {
    if (post) {
      reset({
        caption: post.caption || '',
        subtitle: post.subtitle || '',
        status: post.status
      })

      startTransition(() => {
        if (post.media.length > 0) {
          const existingMedia: LocalMediaItem[] = post.media
            .slice(0, MAX_POST_MEDIA_ITEMS)
            .map((m) => ({
              id: m.id,
              url: m.media_url,
              type: m.media_type,
              isNew: false
            }))
          setMediaItems(existingMedia)
        } else {
          setMediaItems([])
        }
        setError(null)
      })
    } else {
      reset({ caption: '', subtitle: '', status: 'draft' })
      startTransition(() => {
        setMediaItems([])
        setError(null)
      })
    }
  }, [post, open, reset])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (file.size > 50 * 1024 * 1024) {
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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.id === id)
      if (item?.isNew && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url)
      }
      return prev.filter((m) => m.id !== id)
    })
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    if (savePost.isPending) return
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null)

    if (mediaItems.length === 0) {
      setError('Please add at least one image or video')
      return
    }

    if (mediaItems.length > MAX_POST_MEDIA_ITEMS) {
      setError(`Maximum ${MAX_POST_MEDIA_ITEMS} media items per post`)
      return
    }

    try {
      const postData = await savePost.mutateAsync({
        isEditing,
        post: post ?? undefined,
        profileId,
        nextPosition,
        caption: values.caption,
        subtitle: values.subtitle,
        status: values.status,
        mediaItems
      })

      mediaItems.forEach((item) => {
        if (item.isNew && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url)
        }
      })

      onSave(postData)
      onOpenChange(false)
    } catch (err) {
      setError(formatSupabaseError(err))
    }
  })

  const handleDelete = async () => {
    if (!post || !onDelete) return

    try {
      await deletePost.mutateAsync({ post, profileId })
      onDelete(post.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Cleanup blob URLs
      mediaItems.forEach((item) => {
        if (item.isNew && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url)
        }
      })
    }
    onOpenChange(isOpen)
  }

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && isBusy) return
    handleClose(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        headerCloseDisabled={isBusy}
        headerTitle={isEditing ? 'Edit Post' : 'New Post'}
        onEscapeKeyDown={(e) => {
          if (isBusy) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (isBusy) e.preventDefault()
        }}
        headerDescription={
          isEditing
            ? "Update your post's media, caption, and settings."
            : 'Add images or videos to create a new post.'
        }
        headerLeading={
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
            <ImagePlus className="text-muted-foreground h-4 w-4" />
          </div>
        }
      >
        <form id={POST_FORM_ID} className="space-y-4" onSubmit={onSubmit} noValidate>
          <input type="hidden" {...register('status')} />
          {error && (
            <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          {/* Media Grid */}
          <div className="space-y-2">
            <Label>Media</Label>
            <input
              ref={fileInputRef}
              id="media-upload"
              type="file"
              className="hidden"
              accept="image/*,video/*"
              disabled={isBusy}
              onChange={handleFileChange}
              multiple
            />

            <DndContext
              id={`post-form-media-dnd-${formDndId}`}
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={mediaItems.map((m) => m.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 gap-2">
                  {mediaItems.map((item) => (
                    <SortableMediaItem
                      key={item.id}
                      disabled={isBusy}
                      item={item}
                      onRemove={() => handleRemoveMedia(item.id)}
                    />
                  ))}

                  {mediaItems.length < MAX_POST_MEDIA_ITEMS &&
                    (savePost.isPending ? (
                      <div
                        className="border-muted-foreground/25 bg-muted/50 flex aspect-square cursor-not-allowed flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed opacity-50"
                        aria-hidden
                      >
                        <Upload className="text-muted-foreground h-5 w-5" />
                        <span className="text-muted-foreground text-xs">Add</span>
                      </div>
                    ) : (
                      <label
                        className="border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50 hover:bg-muted flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors"
                        htmlFor="media-upload"
                      >
                        <Upload className="text-muted-foreground h-5 w-5" />
                        <span className="text-muted-foreground text-xs">Add</span>
                      </label>
                    ))}
                </div>
              </SortableContext>
            </DndContext>

            <p className="text-muted-foreground text-xs">
              Up to {MAX_POST_MEDIA_ITEMS} items. Drag to reorder. First item shows as cover.
            </p>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (optional)</Label>
            <div className="relative">
              <Music className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="subtitle"
                className="pl-9"
                aria-invalid={!!fieldErrors.subtitle}
                disabled={isBusy}
                placeholder="Song name, location, or note..."
                {...register('subtitle')}
              />
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              aria-invalid={!!fieldErrors.caption}
              disabled={isBusy}
              placeholder="Write a caption..."
              rows={3}
              {...register('caption')}
            />
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(['draft', 'scheduled', 'published'] as const).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    className="flex-1 capitalize"
                    disabled={isBusy}
                    size="sm"
                    variant={status === s ? 'default' : 'outline'}
                    onClick={() => setValue('status', s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {isEditing && onDelete && (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isBusy}
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {deletePost.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <div className="flex flex-1 gap-2 sm:justify-end">
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              disabled={isBusy}
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 sm:flex-none"
              disabled={isBusy || mediaItems.length === 0}
              form={POST_FORM_ID}
            >
              {savePost.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
