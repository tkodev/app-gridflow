'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostPreviewItem } from '@/components/molecules/post-preview-item'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  content: cva('max-w-md overflow-hidden p-0'),
  srOnly: cva('sr-only')
}

// 2. types
type PostPreviewDialogProps = {
  post: Post | null
  profile: Profile
  onClose: () => void
  onEditClick: (post: Post) => void
  className?: string
}

// 3. component
const PostPreviewDialog: React.FC<PostPreviewDialogProps> = (props) => {
  // a. props
  const { post, profile, onClose, onEditClick, className } = props

  // b. hooks

  // c. logic

  // d. component
  if (!post) return null

  return (
    <Dialog open={!!post} onOpenChange={() => onClose()}>
      <DialogContent className={cn(styles.content({ className }))} bodyPadding="none">
        <DialogTitle className={styles.srOnly()}>Post preview</DialogTitle>
        <DialogDescription className={styles.srOnly()}>
          Preview of your post. Close this dialog or use the menu to edit.
        </DialogDescription>
        <PostPreviewItem
          post={post}
          profile={profile}
          onClose={onClose}
          onEditClick={onEditClick}
          isActive
        />
      </DialogContent>
    </Dialog>
  )
}

// 4. exports
export { PostPreviewDialog }
