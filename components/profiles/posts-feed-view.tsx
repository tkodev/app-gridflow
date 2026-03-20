"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import type { Post } from "@/types/post";
import type { Profile } from "@/types/profile";
import { PostPreviewItem } from "./post-preview-item";

function FeedPostItem({
  post,
  profile,
  onEditClick,
}: {
  post: Post;
  profile: Profile;
  onEditClick: (post: Post) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    amount: 0.6, // 60% visible to be considered "in view"
  });

  return (
    <PostPreviewItem
      ref={ref}
      as="article"
      className="overflow-hidden rounded-lg border bg-card"
      post={post}
      profile={profile}
      onEditClick={onEditClick}
      isActive={isInView}
    />
  );
}

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
        <FeedPostItem
          key={post.id}
          post={post}
          profile={profile}
          onEditClick={onEditClick}
        />
      ))}
    </div>
  );
}
