'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import { PostsGridView } from '@/components/organisms/posts-grid-view'
import { ProfileSection } from '@/components/organisms/profile-section'
import { createLandingDemoPosts, LANDING_DEMO_PROFILE } from '@/constants/landing-demo'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-card mx-auto max-w-md rounded-2xl border p-4 shadow-2xl md:max-w-lg'),
  gridWrap: cva('pt-4'),
  hint: cva('text-muted-foreground mt-4 text-center text-sm')
}

// 2. types
type LandingProfileDemoProps = React.ComponentProps<'div'> & VariantProps<typeof styles.root>

// 3. component
const LandingProfileDemo: React.FC<LandingProfileDemoProps> = (props) => {
  const { className, ...rest } = props

  const [posts, setPosts] = useState<Post[]>(() => createLandingDemoPosts())

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = posts.findIndex((p) => p.id === active.id)
      const newIndex = posts.findIndex((p) => p.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      setPosts(arrayMove(posts, oldIndex, newIndex))
    },
    [posts]
  )

  return (
    <div className={cn(styles.root({ className }))} {...rest}>
      <ProfileSection
        nameOnly
        postsCount={posts.length}
        profile={LANDING_DEMO_PROFILE}
        profiles={[LANDING_DEMO_PROFILE]}
      />
      <div className={styles.gridWrap()}>
        <PostsGridView
          posts={posts}
          profile={LANDING_DEMO_PROFILE}
          onDragEnd={handleDragEnd}
          onPostClick={() => {}}
        />
      </div>
      <p className={styles.hint()}>Drag tiles to preview a different feed order</p>
    </div>
  )
}

// 4. exports
export { LandingProfileDemo }
