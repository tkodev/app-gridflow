"use client";

import type { Post } from "@/types/post";
import type { Profile } from "@/types/profile";
import { PostPreviewItem } from "./post-preview-item";

export function PostsFeedView({
  posts,
  profile,
  onEditClick,
}: {
  posts: Post[];
  profile: Profile;
  onEditClick: (post: Post) => void;
}) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostPreviewItem
          key={post.id}
          as="article"
          className="overflow-hidden rounded-lg border bg-card"
          post={post}
          profile={profile}
          onEditClick={onEditClick}
        />
      ))}
    </div>
  );
}
