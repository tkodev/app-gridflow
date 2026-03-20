'use client'

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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostSortableItem } from '@/components/profiles/post-sortable-item'

export const PostsGridView = ({
  posts,
  profile,
  onPostClick,
  onDragEnd
}: {
  posts: Post[]
  profile: Profile
  onPostClick: (post: Post) => void
  onDragEnd: (event: DragEndEvent) => void
}) => {
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

  return (
    <DndContext
      id="posts-grid-dnd"
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={posts} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <PostSortableItem
              key={post.id}
              gridRatio={profile.grid_ratio}
              post={post}
              onClick={() => onPostClick(post)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
