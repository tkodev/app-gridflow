'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import { IntroView } from '@/components/sections/intro-view'
import { PostGridView } from '@/components/sections/post-grid-view'
import { demoPosts, demoProfile } from '@/constants/demo'
import { reorderItemsFromDragEnd } from '@/utils/dnd-kit'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(''),
  previewFallback: cva(
    'bg-muted/40 mx-auto min-h-112 max-w-md animate-pulse rounded-2xl border md:max-w-lg'
  ),
  previewCard: cva('bg-card mx-auto max-w-md rounded-2xl border p-4 shadow-2xl md:max-w-lg'),
  previewDivider: cva('mb-4'),
  previewHint: cva('text-muted-foreground mt-4 text-center text-sm')
}

// 2. types
type DemoViewProps = React.ComponentProps<'div'> & VariantProps<typeof styles.root>

// 3. component
const DemoView: React.FC<DemoViewProps> = (props) => {
  const { className, ...rest } = props

  const [posts, setPosts] = useState<Post[]>(demoPosts)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const next = reorderItemsFromDragEnd(posts, event, (p) => p.id)
      if (next) setPosts(next)
    },
    [posts]
  )

  return (
    <div className={cn(styles.root(), className)} {...rest}>
      <React.Suspense fallback={<div className={styles.previewFallback()} aria-hidden />}>
        <div className={styles.previewCard()}>
          <IntroView
            postsCount={posts.length}
            profile={demoProfile}
            profiles={[demoProfile]}
            readOnly
          />
          <hr className={styles.previewDivider()} />
          <PostGridView
            posts={posts}
            profile={demoProfile}
            onDragEnd={handleDragEnd}
            onPostClick={() => {}}
          />
          <p className={styles.previewHint()}>Drag tiles to preview a different feed order</p>
        </div>
      </React.Suspense>
    </div>
  )
}

// 4. exports
export { DemoView }
