'use client'

import * as React from 'react'
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
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostSortableItem } from '@/components/molecules/post-sortable-item'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('grid grid-cols-12 gap-2'),
  item: cva('col-span-4')
}

// 2. types
type PostGridViewProps = Omit<React.ComponentProps<'div'>, 'onDragEnd'> &
  VariantProps<typeof styles.root> & {
    posts: Post[]
    profile: Profile
    onPostClick: (post: Post) => void
    onDragEnd: (event: DragEndEvent) => void
  }

// 3. component
const PostGridView: React.FC<PostGridViewProps> = (props) => {
  // a. props
  const { posts, profile, onPostClick, onDragEnd, className, ...rest } = props

  // b. hooks
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

  // d. component
  return (
    <DndContext
      id="post-grid-dnd"
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={posts} strategy={rectSortingStrategy}>
        <div className={cn(styles.root({ className }))} {...rest}>
          {posts.map((post) => (
            <PostSortableItem
              key={post.id}
              className={styles.item()}
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

// 4. exports
export type { PostGridViewProps }
export { PostGridView }
