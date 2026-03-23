'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import { PostsGridView } from '@/components/organisms/posts-grid-view'
import { ProfileView } from '@/components/organisms/profile-view'
import { createLandingDemoPosts, LANDING_DEMO_PROFILE } from '@/constants/landing-demo'
import { reorderItemsFromDragEnd } from '@/utils/dnd-kit'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-card mx-auto max-w-md rounded-2xl border p-4 shadow-2xl md:max-w-lg'),
  hint: cva('text-muted-foreground mt-4 text-center text-sm'),
  divider: cva('mb-4')
}

// 2. types
type DemoSectionProps = React.ComponentProps<'div'> & VariantProps<typeof styles.root>

// 3. component
const DemoSection: React.FC<DemoSectionProps> = (props) => {
  const { className, ...rest } = props

  const [posts, setPosts] = useState<Post[]>(() => createLandingDemoPosts())

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const next = reorderItemsFromDragEnd(posts, event, (p) => p.id)
      if (next) setPosts(next)
    },
    [posts]
  )

  return (
    <div className={cn(styles.root({ className }))} {...rest}>
      <ProfileView
        postsCount={posts.length}
        profile={LANDING_DEMO_PROFILE}
        profiles={[LANDING_DEMO_PROFILE]}
        nameOnly
      />
      <hr className={styles.divider()} />
      <PostsGridView
        posts={posts}
        profile={LANDING_DEMO_PROFILE}
        onDragEnd={handleDragEnd}
        onPostClick={() => {}}
      />
      <p className={styles.hint()}>Drag tiles to preview a different feed order</p>
    </div>
  )
}

// 4. exports
export { DemoSection }
