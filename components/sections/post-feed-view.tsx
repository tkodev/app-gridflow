'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostPreviewItem } from '@/components/molecules/post-preview-item'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('space-y-4'),
  item: cva('bg-card overflow-hidden rounded-lg border')
}

// 2. types
type PostFeedViewProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    posts: Post[]
    profile: Profile
    onEditClick: (post: Post) => void
  }

// 3. component
const PostFeedView: React.FC<PostFeedViewProps> = (props) => {
  // a. props
  const { posts, profile, onEditClick, className, ...rest } = props

  // d. component
  return (
    <div className={cn(styles.root({ className }))} {...rest}>
      {posts.map((post) => (
        <PostPreviewItem
          key={post.id}
          className={styles.item()}
          as="article"
          post={post}
          profile={profile}
          onEditClick={onEditClick}
        />
      ))}
    </div>
  )
}

// 4. exports
export { PostFeedView }
