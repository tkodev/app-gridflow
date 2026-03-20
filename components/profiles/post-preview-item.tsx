"use client";

import { forwardRef } from "react";
import { Music, MoreHorizontal, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostStatusPill } from "@/components/profiles/post-status-pill";
import { MediaCarousel } from "@/components/profiles/media-carousel";
import { cn } from "@/lib/utils";
import type { Post, PostMedia } from "@/types/post";
import type { Profile } from "@/types/profile";

interface PostPreviewItemProps {
  post: Post;
  profile: Profile;
  onEditClick: (post: Post) => void;
  onClose?: () => void;
  isActive?: boolean;
  as?: "article" | "div";
  className?: string;
}

export const PostPreviewItem = forwardRef<HTMLElement, PostPreviewItemProps>(
  function PostPreviewItem(
    {
      post,
      profile,
      onEditClick,
      onClose,
      isActive = true,
      as: Root = "div",
      className,
    },
    ref
  ) {
    const dateLabel = post.scheduled_at
      ? `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}`
      : new Date(post.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

    // Build media array from post.media or fallback to legacy image_url
    const media: PostMedia[] =
      post.media && post.media.length > 0
        ? post.media
        : post.image_url
          ? [
              {
                id: "legacy-" + post.id,
                post_id: post.id,
                media_url: post.image_url,
                media_type: "image" as const,
                position: 0,
                created_at: post.created_at,
              },
            ]
          : [];

    return (
      <Root ref={ref as React.Ref<HTMLDivElement> & React.Ref<HTMLElement>} className={cn(className)}>
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

        <MediaCarousel
          media={media}
          aspectRatio="portrait"
          isActive={isActive}
          showControls={true}
        />

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
);
