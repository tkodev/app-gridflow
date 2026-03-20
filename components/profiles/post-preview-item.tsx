"use client";

import Image from "next/image";
import { Music, MoreHorizontal, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostStatusPill } from "@/components/profiles/post-status-pill";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";
import type { Profile } from "@/types/profile";

export function PostPreviewItem({
  post,
  profile,
  onEditClick,
  onClose,
  as: Root = "div",
  className,
}: {
  post: Post;
  profile: Profile;
  onEditClick: (post: Post) => void;
  onClose?: () => void;
  as?: "article" | "div";
  className?: string;
}) {
  const dateLabel = post.scheduled_at
    ? `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}`
    : new Date(post.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });

  return (
    <Root className={cn(className)}>
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
              <Music className="h-3 w-3 shrink-0" />
              <span className="truncate">{post.subtitle}</span>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onEditClick(post)}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">Edit post</span>
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
        <Image
          src={post.image_url}
          alt={post.caption || "Post image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 500px"
        />
      </div>

      {post.caption && (
        <div className="px-3 pt-2">
          <p className="text-sm">
            <span className="font-semibold mr-1.5">{profile.username}</span>
            <span className="text-foreground/90">{post.caption}</span>
          </p>
        </div>
      )}

      <div className="px-3 pb-3 pt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {dateLabel}
        </span>
        <PostStatusPill status={post.status} />
      </div>
    </Root>
  );
}
