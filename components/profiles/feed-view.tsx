"use client";

import Image from "next/image";
import type { Post } from "./posts-grid";

export function FeedView({
  posts,
  onPostClick,
}: {
  posts: Post[];
  onPostClick: (post: Post) => void;
}) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-lg border bg-card"
        >
          <button
            className="relative aspect-square w-full overflow-hidden"
            onClick={() => onPostClick(post)}
          >
            <Image
              src={post.image_url}
              alt={post.caption || "Post image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </button>
          {post.caption && (
            <div className="p-4">
              <p className="text-sm">{post.caption}</p>
            </div>
          )}
          <div className="flex items-center justify-between border-t px-4 py-2">
            <span className="text-xs text-muted-foreground">
              {post.status === "draft" && "Draft"}
              {post.status === "scheduled" && "Scheduled"}
              {post.status === "published" && "Published"}
            </span>
            {post.scheduled_at && (
              <span className="text-xs text-muted-foreground">
                {new Date(post.scheduled_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
