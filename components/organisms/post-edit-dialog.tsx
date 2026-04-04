'use client'

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
import type { TagSet } from '@/types/tag-set'
import { Button } from '@/components/atoms/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/atoms/dialog'
import { Icon } from '@/components/atoms/icon'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Textarea } from '@/components/atoms/textarea'
import { MediaSortableItem } from '@/components/molecules/media-sortable-item'
import { SchedulePicker } from '@/components/molecules/schedule-picker'
import { TagSetSelector } from '@/components/molecules/tag-set-selector'
import { maxPostMediaItems } from '@/constants/storage'
import { useMediaEdit } from '@/hooks/use-media-edit'
import { useDeletePostMutation, useSavePostMutation } from '@/queries/posts'
import { revokeNewBlobUrls } from '@/utils/local-media'
import { formatSupabaseError } from '@/utils/supabase-errors'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const postEditFormId = 'post-edit-dialog-form'
const captionMaxLength = 2200

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
  taglineGlyph: cva('text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'),
  taglineInput: cva('pl-9'),
  subtitleGlyph: cva('text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'),
  subtitleInput: cva('pl-9'),
  relativeWrap: cva('relative'),
  captionFooter: cva('text-muted-foreground flex items-center justify-end text-xs'),
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
  tagline: string
  status: Post['status']
}

type PostEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post?: Post | null
  profileId: string
  nextPosition?: number
  onSave: (post: Post) => void
  onDelete?: (postId: string) => void
  tagSets?: TagSet[]
  className?: string
}

type ScheduleState = { date: string; enabled: boolean; time: string }

function scheduleFromPost(p: Post | null | undefined): ScheduleState {
  if (!p?.scheduled_at) return { date: '', enabled: false, time: '' }
  const d = new Date(p.scheduled_at)
  return {
    date: d.toISOString().slice(0, 10),
    enabled: true,
    time: d.toISOString().slice(11, 16)
  }
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
  tagSets = [],
  className
}) => {
  const formDndId = useId()
  const isEditing = !!post
  const [error, setError] = useState<string | null>(null)
  const [selectedTagSetIds, setSelectedTagSetIds] = useState<string[]>([])
  const [schedule, setSchedule] = useState<ScheduleState>(() => scheduleFromPost(post))

  const {
    mediaItems,
    fileInputRef,
    handleFileChange,
    addMediaFiles,
    handleRemoveMedia,
    handleDragEnd: handleDragEndBase,
    revokePendingBlobUrls
  } = useMediaEdit({ post, open, setError })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors: fieldErrors }
  } = useForm<PostEditFields>({
    defaultValues: {
      caption: '',
      subtitle: '',
      tagline: '',
      status: 'draft'
    }
  })

  const caption = useWatch({ control, name: 'caption' })
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

  const handleTagSetToggle = (id: string) => {
    setSelectedTagSetIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  // Initialize form fields when post / dialog changes (local state must follow server post when opening)
  /* eslint-disable react-hooks/set-state-in-effect -- reset() and schedule/tag state mirror props when dialog opens */
  useEffect(() => {
    if (post) {
      reset({
        caption: post.caption || '',
        subtitle: post.subtitle || '',
        tagline: post.tagline || '',
        status: post.status
      })
      setSchedule(scheduleFromPost(post))
      setSelectedTagSetIds([])
    } else {
      reset({ caption: '', subtitle: '', tagline: '', status: 'draft' })
      setSchedule({ date: '', enabled: false, time: '' })
      setSelectedTagSetIds([])
    }
  }, [post, open, reset])
  /* eslint-enable react-hooks/set-state-in-effect */

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

    const status: Post['status'] = schedule.enabled
      ? 'scheduled'
      : values.status === 'scheduled'
        ? 'draft'
        : values.status
    let scheduledAt: string | null = null
    if (schedule.enabled && schedule.date && schedule.time) {
      scheduledAt = new Date(`${schedule.date}T${schedule.time}`).toISOString()
    }

    try {
      const postData = await savePost.mutateAsync({
        isEditing,
        post: post ?? undefined,
        profileId,
        nextPosition,
        caption: values.caption,
        subtitle: values.subtitle,
        tagline: values.tagline,
        status,
        scheduledAt,
        mediaItems,
        tagSetIds: selectedTagSetIds
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
            <Icon name="imagePlus" size="sm" tone="muted" />
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
                          <Icon name="upload" size="md" tone="muted" />
                          <span className={styles.mutedXs()}>Add</span>
                        </div>
                      ) : (
                        <label className={styles.addSlot()} htmlFor="media-upload">
                          <Icon name="upload" size="md" tone="muted" />
                          <span className={styles.mutedXs()}>Add</span>
                        </label>
                      ))}
                  </div>
                </SortableContext>
              </DndContext>

              {isFileDragOver && !isBusy && (
                <div className={styles.mediaDropOverlay()} aria-hidden>
                  <Icon name="upload" size="lg" tone="muted" />
                  <span>Drop to add</span>
                </div>
              )}
            </div>

            <p className={styles.mutedXs()}>
              Up to {maxPostMediaItems} items. Drag files here or use Add. Drag items to reorder;
              first item shows as cover.
            </p>
          </div>

          {/* Tagline */}
          <div className={styles.fieldGroup()}>
            <Label htmlFor="tagline">Tagline (optional)</Label>
            <div className={styles.relativeWrap()}>
              <Icon name="mapPin" className={styles.taglineGlyph()} size="sm" />
              <Input
                id="tagline"
                className={styles.taglineInput()}
                aria-invalid={!!fieldErrors.tagline}
                disabled={isBusy}
                placeholder="Location or music..."
                {...register('tagline')}
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className={styles.fieldGroup()}>
            <Label htmlFor="subtitle">Subtitle (optional)</Label>
            <div className={styles.relativeWrap()}>
              <Icon name="music" className={styles.subtitleGlyph()} size="sm" />
              <Input
                id="subtitle"
                className={styles.subtitleInput()}
                aria-invalid={!!fieldErrors.subtitle}
                disabled={isBusy}
                placeholder="Song name or note..."
                {...register('subtitle')}
              />
            </div>
          </div>

          {/* Caption with character counter */}
          <div className={styles.fieldGroup()}>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              aria-invalid={!!fieldErrors.caption}
              disabled={isBusy}
              maxLength={captionMaxLength}
              placeholder="Write a caption..."
              rows={3}
              {...register('caption')}
            />
            <p className={styles.captionFooter()}>
              {caption.length}/{captionMaxLength}
            </p>
          </div>

          {/* Tag Sets */}
          {tagSets.length > 0 ? (
            <div className={styles.fieldGroup()}>
              <Label>Tag Sets</Label>
              <TagSetSelector
                disabled={isBusy}
                selectedIds={selectedTagSetIds}
                tagSets={tagSets}
                onToggle={handleTagSetToggle}
              />
            </div>
          ) : null}

          {/* Schedule */}
          <SchedulePicker
            date={schedule.date}
            disabled={isBusy}
            enabled={schedule.enabled}
            time={schedule.time}
            onDateChange={(date) => setSchedule((s) => ({ ...s, date }))}
            onEnabledChange={(enabled) => setSchedule((s) => ({ ...s, enabled }))}
            onTimeChange={(time) => setSchedule((s) => ({ ...s, time }))}
          />
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
              <Icon name="trash2" className={styles.deleteIconLeading()} size="sm" />
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
export type { PostEditDialogProps }
export { PostEditDialog }
