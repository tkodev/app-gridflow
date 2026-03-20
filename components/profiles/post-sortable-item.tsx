"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { PostStatusPill } from "@/components/profiles/post-status-pill";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";

export function PostSortableItem({
  post,
  onClick,
  gridRatio = "square",
}: {
  post: Post;
  onClick: () => void;
  gridRatio?: "square" | "portrait";
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative cursor-grab overflow-hidden bg-muted active:cursor-grabbing",
        gridRatio === "portrait" ? "aspect-[4/5]" : "aspect-square",
        isDragging && "z-10 opacity-80 shadow-lg"
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <Image
        src={post.image_url}
        alt={post.caption || "Post image"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 200px"
      />
      {(post.status === "draft" || post.status === "scheduled") && (
        <div className="absolute right-1 top-1">
          <PostStatusPill status={post.status} compact />
        </div>
      )}
    </button>
  );
}
