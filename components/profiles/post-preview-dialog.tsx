'use client'

import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostPreviewItem } from '@/components/profiles/post-preview-item'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export const PostPreviewDialog = ({
  post,
  profile,
  onClose,
  onEditClick
}: {
  post: Post | null
  profile: Profile
  onClose: () => void
  onEditClick: (post: Post) => void
}) => {
  if (!post) return null

  return (
    <Dialog open={!!post} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md overflow-hidden p-0" bodyClassName="p-0">
        <DialogTitle className="sr-only">Post preview</DialogTitle>
        <DialogDescription className="sr-only">
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
