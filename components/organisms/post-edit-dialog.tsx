'use client'

import { ImagePlus, Music, Trash2, Upload } from 'lucide-react'
import * as React from 'react'
import { useEffect, useId, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { cva } from 'class-variance-authority'
import type { Post } from '@/types/post'
import { Button } from '@/components/atoms/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/atoms/dialog'
import { Icon } from '@/components/atoms/icon'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Textarea } from '@/components/atoms/textarea'
import { MediaSortableItem } from '@/components/molecules/media-sortable-item'
import { maxPostMediaItems } from '@/constants/storage'
import { usePostEditMedia } from '@/hooks/use-post-edit-media'
import { useDeletePostMutation, useSavePostMutation } from '@/queries/posts'
import { revokeNewBlobUrls } from '@/utils/local-media'
import { formatSupabaseError } from '@/utils/supabase-errors'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const postEditFormId = 'post-edit-dialog-form'

const styles = {
  dialogContent: cva('sm:max-w-lg'),
  headerLeading: cva('bg-muted flex size-8 items-center justify-center rounded-full'),
  form: cva('space-y-4'),
  errorBanner: cva(
    'border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'
  ),
  fieldGroup: cva('space-y-2'),
  hiddenFileInput: cva('hidden'),
  mediaDropZone: cva('relative rounded-lg transition-colors'),
  mediaDropOverlay: cva(
    'bg-background/85 border-primary/50 text-foreground pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm font-medium backdrop-blur-sm'
  ),
  mediaGrid: cva('grid grid-cols-12 gap-2'),
  addSlotDisabled: cva(
    'border-muted-foreground/25 bg-muted/50 col-span-4 flex aspect-square cursor-not-allowed flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed opacity-50'
  ),
  addSlot: cva(
    'border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50 hover:bg-muted col-span-4 flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors'
  ),
  mutedXs: cva('text-muted-foreground text-xs'),
  subtitleGlyph: cva('text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'),
  subtitleInput: cva('pl-9'),
  relativeWrap: cva('relative'),
  statusSection: cva('space-y-2'),
  statusButtons: cva('flex gap-2'),
  statusButton: cva('flex-1 capitalize'),
  footer: cva('flex-col gap-2 sm:flex-row'),
  deleteButton: cva('w-full sm:w-auto'),
  footerActions: cva('flex flex-1 gap-2 sm:justify-end'),
  footerButton: cva('flex-1 sm:flex-none'),
  deleteIconLeading: cva('mr-1.5')
}

// 2. types
type PostEditFields = {
  caption: string
  subtitle: string
  status: Post['status']
}

type PostEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post?: Post | null // If provided, we're editing; otherwise creating
  profileId: string
  nextPosition?: number
  onSave: (post: Post) => void
  onDelete?: (postId: string) => void
  className?: string
}

// 3. component — post create/edit dialog
const PostEditDialog: React.FC<PostEditDialogProps> = ({
  open,
  onOpenChange,
  post,
  profileId,
  nextPosition = 0,
  onSave,
  onDelete,
  className
}) => {
  const formDndId = useId()
  const isEditing = !!post
  const [error, setError] = useState<string | null>(null)

  const {
    mediaItems,
    fileInputRef,
    handleFileChange,
    addMediaFiles,
    handleRemoveMedia,
    handleDragEnd: handleDragEndBase,
    revokePendingBlobUrls
  } = usePostEditMedia({ post, open, setError })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors: fieldErrors }
  } = useForm<PostEditFields>({
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

  const [isFileDragOver, setIsFileDragOver] = useState(false)

  const hasDraggedFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

  const handleMediaDragEnter = (e: React.DragEvent) => {
    if (!hasDraggedFiles(e) || isBusy) return
    e.preventDefault()
    e.stopPropagation()
    setIsFileDragOver(true)
  }

  const handleMediaDragOver = (e: React.DragEvent) => {
    if (!hasDraggedFiles(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = isBusy ? 'none' : 'copy'
  }

  const handleMediaDragOverCapture = (e: React.DragEvent) => {
    if (!hasDraggedFiles(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = isBusy ? 'none' : 'copy'
  }

  const handleMediaDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(e)) return
    const related = e.relatedTarget as Node | null
    if (related && e.currentTarget.contains(related)) return
    setIsFileDragOver(false)
  }

  const handleMediaDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsFileDragOver(false)
    if (isBusy) return
    addMediaFiles(Array.from(e.dataTransfer.files || []))
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Initialize form fields when post / dialog changes
  useEffect(() => {
    if (post) {
      reset({
        caption: post.caption || '',
        subtitle: post.subtitle || '',
        status: post.status
      })
    } else {
      reset({ caption: '', subtitle: '', status: 'draft' })
    }
  }, [post, open, reset])

  const onSubmit = handleSubmit(async (values) => {
    setError(null)

    if (mediaItems.length === 0) {
      setError('Please add at least one image or video')
      return
    }

    if (mediaItems.length > maxPostMediaItems) {
      setError(`Maximum ${maxPostMediaItems} media items per post`)
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

      revokeNewBlobUrls(mediaItems)

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
      revokePendingBlobUrls()
      setIsFileDragOver(false)
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
        className={cn(styles.dialogContent({ className }))}
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
          <div className={styles.headerLeading()}>
            <Icon icon={ImagePlus} size="sm" tone="muted" />
          </div>
        }
      >
        <form id={postEditFormId} className={styles.form()} onSubmit={onSubmit} noValidate>
          <input type="hidden" {...register('status')} />
          {error && <div className={styles.errorBanner()}>{error}</div>}

          {/* Media Grid */}
          <div className={styles.fieldGroup()}>
            <Label>Media</Label>
            <input
              ref={fileInputRef}
              id="media-upload"
              type="file"
              className={styles.hiddenFileInput()}
              accept="image/*,video/*"
              disabled={isBusy}
              onChange={handleFileChange}
              multiple
            />

            <div
              className={styles.mediaDropZone()}
              aria-label="Drop images or videos here"
              onDragEnter={handleMediaDragEnter}
              onDragLeave={handleMediaDragLeave}
              onDragOver={handleMediaDragOver}
              onDragOverCapture={handleMediaDragOverCapture}
              onDrop={handleMediaDrop}
            >
              <DndContext
                id={`post-edit-media-dnd-${formDndId}`}
                collisionDetection={closestCenter}
                sensors={sensors}
                onDragEnd={(e) => handleDragEndBase(e, { disabled: savePost.isPending })}
              >
                <SortableContext items={mediaItems.map((m) => m.id)} strategy={rectSortingStrategy}>
                  <div className={styles.mediaGrid()}>
                    {mediaItems.map((item) => (
                      <MediaSortableItem
                        key={item.id}
                        disabled={isBusy}
                        item={item}
                        onRemove={() => handleRemoveMedia(item.id)}
                      />
                    ))}

                    {mediaItems.length < maxPostMediaItems &&
                      (savePost.isPending ? (
                        <div className={styles.addSlotDisabled()} aria-hidden>
                          <Icon icon={Upload} size="md" tone="muted" />
                          <span className={styles.mutedXs()}>Add</span>
                        </div>
                      ) : (
                        <label className={styles.addSlot()} htmlFor="media-upload">
                          <Icon icon={Upload} size="md" tone="muted" />
                          <span className={styles.mutedXs()}>Add</span>
                        </label>
                      ))}
                  </div>
                </SortableContext>
              </DndContext>

              {isFileDragOver && !isBusy && (
                <div className={styles.mediaDropOverlay()} aria-hidden>
                  <Icon icon={Upload} size="lg" tone="muted" />
                  <span>Drop to add</span>
                </div>
              )}
            </div>

            <p className={styles.mutedXs()}>
              Up to {maxPostMediaItems} items. Drag files here or use Add. Drag items to reorder;
              first item shows as cover.
            </p>
          </div>

          {/* Subtitle */}
          <div className={styles.fieldGroup()}>
            <Label htmlFor="subtitle">Subtitle (optional)</Label>
            <div className={styles.relativeWrap()}>
              <Icon className={styles.subtitleGlyph()} icon={Music} size="sm" />
              <Input
                id="subtitle"
                className={styles.subtitleInput()}
                aria-invalid={!!fieldErrors.subtitle}
                disabled={isBusy}
                placeholder="Song name, location, or note..."
                {...register('subtitle')}
              />
            </div>
          </div>

          {/* Caption */}
          <div className={styles.fieldGroup()}>
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
            <div className={styles.statusSection()}>
              <Label>Status</Label>
              <div className={styles.statusButtons()}>
                {(['draft', 'scheduled', 'published'] as const).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    className={styles.statusButton()}
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

        <DialogFooter className={styles.footer()}>
          {isEditing && onDelete && (
            <Button
              type="button"
              className={styles.deleteButton()}
              disabled={isBusy}
              variant="destructive"
              onClick={handleDelete}
            >
              <Icon className={styles.deleteIconLeading()} icon={Trash2} size="sm" />
              {deletePost.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <div className={styles.footerActions()}>
            <Button
              type="button"
              className={styles.footerButton()}
              disabled={isBusy}
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={styles.footerButton()}
              disabled={isBusy || mediaItems.length === 0}
              form={postEditFormId}
            >
              {savePost.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 4. exports
export { PostEditDialog }
