"use client";

import Image from "next/image";
import { Music } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "./posts-grid";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function FeedView({
  posts,
  profile,
  onPostClick,
}: {
  posts: Post[];
  profile: Profile;
  onPostClick: (post: Post) => void;
}) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-lg border bg-card"
        >
          {/* Header - Username and Subtitle */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile.username}</p>
              {post.subtitle && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Music className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{post.subtitle}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-muted">
              {post.status}
            </span>
          </div>

          {/* Image */}
          <button
            className="relative aspect-[4/5] w-full overflow-hidden bg-muted"
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

          {/* Footer - Username + Caption */}
          {post.caption && (
            <div className="px-3 py-2.5">
              <p className="text-sm">
                <span className="font-semibold mr-1.5">{profile.username}</span>
                <span className="text-foreground/90">{post.caption}</span>
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="px-3 pb-2.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {post.scheduled_at
                ? `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}`
                : new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
