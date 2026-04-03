'use client'

import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { cva } from 'class-variance-authority'
import type { TagSet } from '@/types/tag-set'
import { Button } from '@/components/atoms/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/atoms/dialog'
import { Icon } from '@/components/atoms/icon'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Textarea } from '@/components/atoms/textarea'
import { useDeleteTagSetMutation, useSaveTagSetMutation } from '@/queries/tag-sets'
import { formatSupabaseError } from '@/utils/supabase-errors'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const tagSetEditFormId = 'tag-set-edit-dialog-form'

const styles = {
  dialogContent: cva('sm:max-w-md'),
  headerLeading: cva('bg-muted flex size-8 items-center justify-center rounded-full'),
  form: cva('space-y-4'),
  errorBanner: cva(
    'border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'
  ),
  fieldGroup: cva('space-y-2'),
  hint: cva('text-muted-foreground text-xs'),
  footerRow: cva('flex w-full items-center justify-between gap-2 p-3')
}

// 2. types
type TagSetEditFields = {
  name: string
  tags: string
}

type TagSetEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tagSet?: TagSet | null
  profileId: string
  className?: string
}

// 3. component
const TagSetEditDialog: React.FC<TagSetEditDialogProps> = (props) => {
  // a. props
  const { open, onOpenChange, tagSet, profileId, className } = props

  // b. hooks
  const isEditing = Boolean(tagSet)
  const saveTagSet = useSaveTagSetMutation()
  const deleteTagSet = useDeleteTagSetMutation()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<TagSetEditFields>({
    values: {
      name: tagSet?.name ?? '',
      tags: tagSet?.tags ?? ''
    }
  })

  const isBusy = saveTagSet.isPending || deleteTagSet.isPending

  // c. logic
  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await saveTagSet.mutateAsync({
        isEditing,
        tagSet,
        profileId,
        name: values.name,
        tags: values.tags
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(formatSupabaseError(err))
    }
  })

  const onDelete = async () => {
    if (!tagSet) return
    setError(null)
    try {
      await deleteTagSet.mutateAsync({ tagSet })
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(formatSupabaseError(err))
    }
  }

  // d. component
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(styles.dialogContent({ className }))}
        headerTitle={isEditing ? 'Edit Tag Set' : 'New Tag Set'}
        headerDescription="Group related hashtags for quick reuse"
        headerLeading={
          <div className={styles.headerLeading()}>
            <Icon name="tags" size="sm" />
          </div>
        }
        headerCloseDisabled={isBusy}
      >
        <form id={tagSetEditFormId} className={styles.form()} onSubmit={onSubmit}>
          {error ? <div className={styles.errorBanner()}>{error}</div> : null}
          <div className={styles.fieldGroup()}>
            <Label htmlFor="tag-set-name">Name</Label>
            <Input
              id="tag-set-name"
              placeholder="e.g. Minimalist Vibes"
              disabled={isBusy}
              {...register('name', { required: true })}
            />
          </div>
          <div className={styles.fieldGroup()}>
            <Label htmlFor="tag-set-tags">Tags</Label>
            <Textarea
              id="tag-set-tags"
              placeholder="#minimalist #monochrome #cleanfeed"
              disabled={isBusy}
              {...register('tags')}
            />
            <p className={styles.hint()}>Separate hashtags with spaces</p>
          </div>
        </form>
        <DialogFooter>
          <div className={styles.footerRow()}>
            <div>
              {isEditing ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isBusy}
                  onClick={onDelete}
                >
                  Delete
                </Button>
              ) : null}
            </div>
            <Button type="submit" form={tagSetEditFormId} size="sm" disabled={isBusy}>
              {isEditing ? 'Save Changes' : 'Create Tag Set'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 4. exports
export type { TagSetEditDialogProps }
export { TagSetEditDialog }
