'use client'

import { Filter, Plus } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Collection } from '@/types/collection'
import type { TagSet } from '@/types/tag-set'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { CollectionCard } from '@/components/molecules/collection-card'
import { TagSetCard } from '@/components/molecules/tag-set-card'
import { CollectionEditDialog } from '@/components/organisms/collection-edit-dialog'
import { TagSetEditDialog } from '@/components/organisms/tag-set-edit-dialog'
import { useCollectionsQuery } from '@/queries/collections'
import { useTagSetsQuery } from '@/queries/tag-sets'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('flex flex-col gap-8 py-6'),
  sectionHeader: cva('flex items-center justify-between'),
  sectionLabel: cva('text-muted-foreground text-xs font-semibold tracking-widest uppercase'),
  sectionTitle: cva('text-lg font-semibold'),
  viewAll: cva('text-muted-foreground text-xs font-medium uppercase tracking-wide'),
  collectionsScroll: cva('flex gap-3 overflow-x-auto pb-2 -mx-1 px-1'),
  tagSetList: cva('flex flex-col gap-2'),
  emptyState: cva('text-muted-foreground py-8 text-center text-sm'),
  fab: cva('fixed right-4 bottom-24 z-40')
}

// 2. types
type CollectViewProps = {
  profileId: string
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const CollectView: React.FC<CollectViewProps> = (props) => {
  // a. props
  const { profileId, className } = props

  // b. hooks
  const collectionsQuery = useCollectionsQuery(profileId)
  const tagSetsQuery = useTagSetsQuery(profileId)

  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

  const [tagSetDialogOpen, setTagSetDialogOpen] = useState(false)
  const [editingTagSet, setEditingTagSet] = useState<TagSet | null>(null)

  const [fabMode, setFabMode] = useState<'collection' | 'tagSet'>('collection')

  // c. logic
  const collections = collectionsQuery.data ?? []
  const tagSets = tagSetsQuery.data ?? []

  const openNewCollection = () => {
    setEditingCollection(null)
    setCollectionDialogOpen(true)
  }

  const openEditCollection = (collection: Collection) => {
    setEditingCollection(collection)
    setCollectionDialogOpen(true)
  }

  const openNewTagSet = () => {
    setEditingTagSet(null)
    setTagSetDialogOpen(true)
  }

  const openEditTagSet = (tagSet: TagSet) => {
    setEditingTagSet(tagSet)
    setTagSetDialogOpen(true)
  }

  const onFabClick = () => {
    if (fabMode === 'collection') {
      openNewCollection()
    } else {
      openNewTagSet()
    }
  }

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      {/* Library — Collections */}
      <section>
        <div className={styles.sectionHeader()}>
          <div>
            <p className={styles.sectionLabel()}>Library</p>
            <h2 className={styles.sectionTitle()}>Collections</h2>
          </div>
          <button
            type="button"
            className={styles.viewAll()}
            onClick={openNewCollection}
          >
            + New
          </button>
        </div>
        {collections.length > 0 ? (
          <div className={styles.collectionsScroll()}>
            {collections.map((c) => {
              const media = 'media' in c ? (c as typeof c & { media: unknown[] }).media : []
              return (
                <CollectionCard
                  key={c.id}
                  collection={c}
                  mediaCount={media.length}
                  onClick={() => openEditCollection(c)}
                />
              )
            })}
          </div>
        ) : (
          <p className={styles.emptyState()}>
            No collections yet. Create one to organize your media.
          </p>
        )}
      </section>

      {/* Taxonomy — Tag Sets */}
      <section>
        <div className={styles.sectionHeader()}>
          <div>
            <p className={styles.sectionLabel()}>Taxonomy</p>
            <h2 className={styles.sectionTitle()}>Tag Sets</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={openNewTagSet}>
            <Icon icon={Plus} size="sm" />
          </Button>
        </div>
        {tagSets.length > 0 ? (
          <div className={styles.tagSetList()}>
            {tagSets.map((ts) => (
              <TagSetCard
                key={ts.id}
                tagSet={ts}
                onClick={() => openEditTagSet(ts)}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState()}>
            No tag sets yet. Create reusable hashtag groups for your posts.
          </p>
        )}
      </section>

      {/* FAB */}
      <div className={styles.fab()}>
        <Button size="icon-lg" onClick={onFabClick}>
          <Icon icon={Plus} size="sm" />
          <span className="sr-only">Add new</span>
        </Button>
      </div>

      {/* Dialogs */}
      <CollectionEditDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        collection={editingCollection}
        profileId={profileId}
      />
      <TagSetEditDialog
        open={tagSetDialogOpen}
        onOpenChange={setTagSetDialogOpen}
        tagSet={editingTagSet}
        profileId={profileId}
      />
    </div>
  )
}

// 4. exports
export type { CollectViewProps }
export { CollectView }
