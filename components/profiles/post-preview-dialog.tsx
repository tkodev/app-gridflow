"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PostPreviewItem } from "@/components/profiles/post-preview-item";
import type { Post } from "@/types/post";
import type { Profile } from "@/types/profile";

export function PostPreviewDialog({
  post,
  profile,
  onClose,
  onEditClick,
}: {
  post: Post | null;
  profile: Profile;
  onClose: () => void;
  onEditClick: (post: Post) => void;
}) {
  if (!post) return null;

  return (
    <Dialog open={!!post} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Post preview</DialogTitle>
        <DialogDescription className="sr-only">
          Preview of your post. Close this dialog or use the menu to edit.
        </DialogDescription>
        <PostPreviewItem
          post={post}
          profile={profile}
          onEditClick={onEditClick}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
