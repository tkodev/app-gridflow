"use client";

import Image from "next/image";
import { Music, MoreHorizontal, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onEditClick,
}: {
  posts: Post[];
  profile: Profile;
  onEditClick: (post: Post) => void;
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Post options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditClick(post)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image - no click action */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
            <Image
              src={post.image_url}
              alt={post.caption || "Post image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>

          {/* Status badge */}
          <div className="px-3 pt-2.5">
            <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-muted">
              {post.status}
            </span>
          </div>

          {/* Footer - Username + Caption */}
          {post.caption && (
            <div className="px-3 pt-2">
              <p className="text-sm">
                <span className="font-semibold mr-1.5">{profile.username}</span>
                <span className="text-foreground/90">{post.caption}</span>
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="px-3 pb-2.5 pt-1">
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
