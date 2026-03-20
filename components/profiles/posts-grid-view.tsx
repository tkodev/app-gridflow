'use client'

import { Grid3X3, Image as ImageIcon, List, Pencil, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostFormDialog } from '@/components/profiles/post-form-dialog'
import { PostPreviewDialog } from '@/components/profiles/post-preview-dialog'
import { PostSortableItem } from '@/components/profiles/post-sortable-item'
import { PostsFeedView } from '@/components/profiles/posts-feed-view'
import { ProfileEditDialog } from '@/components/profiles/profile-edit-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useReorderPostsMutation } from '@/queries/posts'

export type { Post } from '@/types/post'
export type { Profile } from '@/types/profile'

export const PostsGridView = ({
  initialPosts,
  profile
}: {
  initialPosts: Post[]
  profile: Profile
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [previewPost, setPreviewPost] = useState<Post | null>(null)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const reorderPosts = useReorderPostsMutation()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

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
        // Update existing post
        return prev.map((p) => (p.id === savedPost.id ? savedPost : p))
      } else {
        // Add new post
        return [...prev, savedPost]
      }
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

  return (
    <>
      <Tabs className="w-full" defaultValue="grid">
        <div className="flex items-center justify-between gap-2 pt-2">
          <TabsList>
            <TabsTrigger className="gap-1.5" value="grid">
              <Grid3X3 className="size-4" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger className="gap-1.5" value="feed">
              <List className="size-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowEditProfileDialog(true)}>
              <Pencil className="mr-1.5 size-4" />
              Edit Profile
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Post
            </Button>
          </div>
        </div>

        <TabsContent className="mt-4" value="grid">
          {posts.length === 0 ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <DndContext
              id="posts-grid-dnd"
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={posts} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 gap-1">
                  {posts.map((post) => (
                    <PostSortableItem
                      key={post.id}
                      gridRatio={profile.grid_ratio}
                      post={post}
                      onClick={() => setPreviewPost(post)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent className="mt-4" value="feed">
          {posts.length === 0 ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <PostsFeedView posts={posts} profile={profile} onEditClick={setEditPost} />
          )}
        </TabsContent>
      </Tabs>

      {/* Add Post Dialog */}
      <PostFormDialog
        nextPosition={posts.length}
        open={showAddDialog}
        profileId={profile.id}
        onOpenChange={setShowAddDialog}
        onSave={handleSavePost}
      />

      {/* Edit Post Dialog */}
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

const EmptyState = ({ onAdd }: { onAdd: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed">
        <ImageIcon className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="mt-4 font-semibold">No posts yet</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Start building your grid by adding your first post
      </p>
      <Button className="mt-4" onClick={onAdd}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Your First Post
      </Button>
    </div>
  )
}
