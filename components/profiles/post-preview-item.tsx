"use client";

import { forwardRef, useCallback, useRef } from "react";
import { useInView } from "framer-motion";
import { Music, MoreHorizontal, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostStatusPill } from "@/components/profiles/post-status-pill";
import { PostMediaCarousel } from "@/components/profiles/post-media-carousel";
import { cn } from "@/utils/tailwind";
import type { Post, PostMedia } from "@/types/post";
import type { Profile } from "@/types/profile";

interface PostPreviewItemProps {
  post: Post;
  profile: Profile;
  onEditClick: (post: Post) => void;
  onClose?: () => void;
  /** When set, overrides scroll-based visibility for video autoplay */
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
      isActive: isActiveProp,
      as: Root = "div",
      className,
    },
    ref
  ) {
    const innerRef = useRef<HTMLElement | null>(null);
    const isInView = useInView(innerRef, { amount: 0.6 });
    const isActive =
      isActiveProp !== undefined ? isActiveProp : isInView;

    const setRef = useCallback(
      (node: HTMLElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref]
    );

    const dateLabel = post.scheduled_at
      ? `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}`
      : new Date(post.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

    const media: PostMedia[] = post.media;

    return (
      <Root
        ref={setRef as React.Ref<HTMLDivElement> & React.Ref<HTMLElement>}
        className={cn(className)}
      >
        <div className="flex items-center gap-3 p-3">
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

        <PostMediaCarousel
          media={media}
          aspectRatio="portrait"
          isActive={isActive}
          showControls={true}
        />

        <div className="flex flex-col gap-3 p-3">
          {post.caption && (
            <div>
              <p className="text-sm">
                <span className="font-semibold mr-1.5">{profile.username}</span>
                <span className="text-foreground/90">{post.caption}</span>
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {dateLabel}
            </span>
            <PostStatusPill status={post.status} />
          </div>
        </div>
      </Root>
    );
  }
);
