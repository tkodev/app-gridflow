'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import { Grid3X3, Image as ImageIcon, List, Pencil, Plus } from 'lucide-react'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostFormDialog } from '@/components/organisms/post-form-dialog'
import { PostPreviewDialog } from '@/components/organisms/post-preview-dialog'
import { PostsFeedView } from '@/components/organisms/posts-feed-view'
import { PostsGridView } from '@/components/organisms/posts-grid-view'
import { ProfileEditDialog } from '@/components/organisms/profile-edit-dialog'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs'
import { useReorderPostsMutation } from '@/queries/posts'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  emptyRoot: cva('flex flex-col items-center justify-center py-16 text-center'),
  emptyIconRing: cva(
    'flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed'
  ),
  emptyTitle: cva('mt-4 font-semibold'),
  emptyDescription: cva('text-muted-foreground mt-1 text-sm'),
  emptyAddButton: cva('mt-4'),
  toolbar: cva('flex items-center justify-between gap-2 pt-2'),
  tabLabel: cva('hidden sm:inline'),
  tabTrigger: cva('gap-1.5'),
  actions: cva('flex gap-2'),
  tabsContent: cva('mt-4'),
  tabsRoot: cva('w-full')
}

// 2. types
type PostsSectionProps = {
  initialPosts: Post[]
  profile: Profile
  className?: string
}

type EmptyStateProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.emptyRoot> & {
    onAdd: () => void
  }

// 3. component
const EmptyState: React.FC<EmptyStateProps> = (props) => {
  // a. props
  const { onAdd, className, ...rest } = props

  // b. hooks

  // c. logic

  // d. component
  return (
    <div className={cn(styles.emptyRoot({ className }))} {...rest}>
      <div className={styles.emptyIconRing()}>
        <Icon icon={ImageIcon} size="lg" tone="muted" />
      </div>
      <h3 className={styles.emptyTitle()}>No posts yet</h3>
      <p className={styles.emptyDescription()}>
        Start building your grid by adding your first post
      </p>
      <Button className={styles.emptyAddButton()} onClick={onAdd}>
        <Icon icon={Plus} size="sm" slot="buttonLeading" />
        Add Your First Post
      </Button>
    </div>
  )
}

const PostsSection: React.FC<PostsSectionProps> = (props) => {
  // a. props
  const { initialPosts, profile, className } = props

  // b. hooks
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [previewPost, setPreviewPost] = useState<Post | null>(null)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const reorderPosts = useReorderPostsMutation()

  // c. logic
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = posts.findIndex((p) => p.id === active.id)
        const newIndex = posts.findIndex((p) => p.id === over.id)

        const previous = posts
        const newPosts = arrayMove(posts, oldIndex, newIndex)
        setPosts(newPosts)

        try {
          await reorderPosts.mutateAsync({ orderedPosts: newPosts })
        } catch {
          setPosts(previous)
        }
      }
    },
    [posts, reorderPosts]
  )

  const handleSavePost = (savedPost: Post) => {
    setPosts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === savedPost.id)
      if (existingIndex >= 0) {
        return prev.map((p) => (p.id === savedPost.id ? savedPost : p))
      }
      return [...prev, savedPost]
    })
    setShowAddDialog(false)
    setEditPost(null)
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setEditPost(null)
  }

  const handleEditFromPreview = (post: Post) => {
    setPreviewPost(null)
    setEditPost(post)
  }

  // d. component
  return (
    <>
      <Tabs className={cn(styles.tabsRoot({ className }))} defaultValue="grid">
        <div className={styles.toolbar()}>
          <TabsList>
            <TabsTrigger className={styles.tabTrigger()} value="grid">
              <Icon icon={Grid3X3} size="sm" />
              <span className={styles.tabLabel()}>Grid</span>
            </TabsTrigger>
            <TabsTrigger className={styles.tabTrigger()} value="feed">
              <Icon icon={List} size="sm" />
              <span className={styles.tabLabel()}>Feed</span>
            </TabsTrigger>
          </TabsList>
          <div className={styles.actions()}>
            <Button size="sm" variant="outline" onClick={() => setShowEditProfileDialog(true)}>
              <Icon icon={Pencil} size="sm" slot="buttonLeading" />
              Edit Profile
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Icon icon={Plus} size="sm" slot="buttonLeading" />
              Add Post
            </Button>
          </div>
        </div>

        <TabsContent className={styles.tabsContent()} value="grid">
          {posts.length === 0 ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <PostsGridView
              posts={posts}
              profile={profile}
              onDragEnd={handleDragEnd}
              onPostClick={setPreviewPost}
            />
          )}
        </TabsContent>

        <TabsContent className={styles.tabsContent()} value="feed">
          {posts.length === 0 ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <PostsFeedView posts={posts} profile={profile} onEditClick={setEditPost} />
          )}
        </TabsContent>
      </Tabs>

      <PostFormDialog
        nextPosition={posts.length}
        open={showAddDialog}
        profileId={profile.id}
        onOpenChange={setShowAddDialog}
        onSave={handleSavePost}
      />

      <PostFormDialog
        open={!!editPost}
        post={editPost}
        profileId={profile.id}
        onDelete={handleDeletePost}
        onOpenChange={(open) => !open && setEditPost(null)}
        onSave={handleSavePost}
      />

      <PostPreviewDialog
        post={previewPost}
        profile={profile}
        onClose={() => setPreviewPost(null)}
        onEditClick={handleEditFromPreview}
      />

      <ProfileEditDialog
        open={showEditProfileDialog}
        profile={profile}
        onOpenChange={setShowEditProfileDialog}
      />
    </>
  )
}

// 4. exports
export { PostsSection }
