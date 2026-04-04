'use client'

import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { cva } from 'class-variance-authority'
import type { Collection } from '@/types/collection'
import { Button } from '@/components/atoms/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/atoms/dialog'
import { Icon } from '@/components/atoms/icon'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Textarea } from '@/components/atoms/textarea'
import { useDeleteCollectionMutation, useSaveCollectionMutation } from '@/queries/collections'
import { formatSupabaseError } from '@/utils/supabase-errors'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const collectionEditFormId = 'collection-edit-dialog-form'

const styles = {
  dialogContent: cva('sm:max-w-md'),
  headerLeading: cva('bg-muted flex size-8 items-center justify-center rounded-full'),
  form: cva('space-y-4'),
  errorBanner: cva(
    'border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'
  ),
  fieldGroup: cva('space-y-2'),
  footerRow: cva('flex w-full items-center justify-between gap-2 p-3')
}

// 2. types
type CollectionEditFields = {
  name: string
  description: string
}

type CollectionEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection?: Collection | null
  profileId: string
  className?: string
}

// 3. component
const CollectionEditDialog: React.FC<CollectionEditDialogProps> = (props) => {
  // a. props
  const { open, onOpenChange, collection, profileId, className } = props

  // b. hooks
  const isEditing = Boolean(collection)
  const saveCollection = useSaveCollectionMutation()
  const deleteCollection = useDeleteCollectionMutation()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<CollectionEditFields>({
    values: {
      name: collection?.name ?? '',
      description: collection?.description ?? ''
    }
  })

  const isBusy = saveCollection.isPending || deleteCollection.isPending

  // c. logic
  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await saveCollection.mutateAsync({
        isEditing,
        collection,
        profileId,
        name: values.name,
        description: values.description
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(formatSupabaseError(err))
    }
  })

  const onDelete = async () => {
    if (!collection) return
    setError(null)
    try {
      await deleteCollection.mutateAsync({ collection })
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
        headerCloseDisabled={isBusy}
        headerDescription="Organize your media into curated groups"
        headerTitle={isEditing ? 'Edit Collection' : 'New Collection'}
        headerLeading={
          <div className={styles.headerLeading()}>
            <Icon name="folderPlus" size="sm" />
          </div>
        }
      >
        <form id={collectionEditFormId} className={styles.form()} onSubmit={onSubmit}>
          {error ? <div className={styles.errorBanner()}>{error}</div> : null}
          <div className={styles.fieldGroup()}>
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              disabled={isBusy}
              placeholder="e.g. Archived Moments"
              {...register('name', { required: true })}
            />
          </div>
          <div className={styles.fieldGroup()}>
            <Label htmlFor="collection-description">Description</Label>
            <Textarea
              id="collection-description"
              disabled={isBusy}
              placeholder="What is this collection about?"
              {...register('description')}
            />
          </div>
        </form>
        <DialogFooter>
          <div className={styles.footerRow()}>
            <div>
              {isEditing ? (
                <Button
                  type="button"
                  disabled={isBusy}
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              ) : null}
            </div>
            <Button type="submit" disabled={isBusy} form={collectionEditFormId} size="sm">
              {isEditing ? 'Save Changes' : 'Create Collection'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 4. exports
export type { CollectionEditDialogProps }
export { CollectionEditDialog }
