"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash2,
  Upload,
  Music,
  ImagePlus,
  X,
  GripVertical,
  Play,
} from "lucide-react";
import { formatSupabaseError } from "@/utils/supabase-errors";
import { useSavePostMutation, useDeletePostMutation } from "@/queries/posts";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MAX_POST_MEDIA_ITEMS } from "@/constants/posts";
import { cn } from "@/utils/tailwind";
import type { Post, LocalMediaItem } from "@/types/post";

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post | null; // If provided, we're editing; otherwise creating
  profileId: string;
  nextPosition?: number;
  onSave: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

function SortableMediaItem({
  item,
  onRemove,
  disabled,
}: {
  item: LocalMediaItem;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg bg-muted",
        isDragging && "z-10 opacity-80 shadow-lg"
      )}
    >
      {item.type === "video" ? (
        <div className="relative h-full w-full">
          <video
            src={item.url}
            className="h-full w-full object-cover"
            muted
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
      ) : (
        <img
          src={item.url}
          alt=""
          className="h-full w-full object-cover"
        />
      )}

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...(disabled ? {} : listeners)}
        disabled={disabled}
        className={cn(
          "absolute left-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100",
          disabled
            ? "cursor-not-allowed opacity-40"
            : "cursor-grab active:cursor-grabbing"
        )}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute right-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Type indicator */}
      {item.type === "video" && (
        <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
          VIDEO
        </span>
      )}
    </div>
  );
}

export function PostFormDialog({
  open,
  onOpenChange,
  post,
  profileId,
  nextPosition = 0,
  onSave,
  onDelete,
}: PostFormDialogProps) {
  const formDndId = useId();
  const isEditing = !!post;
  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([]);
  const [caption, setCaption] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [status, setStatus] = useState<Post["status"]>("draft");
  const [error, setError] = useState<string | null>(null);
  const savePost = useSavePostMutation();
  const deletePost = useDeletePostMutation();
  const isBusy = savePost.isPending || deletePost.isPending;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize form when post changes
  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      setSubtitle(post.subtitle || "");
      setStatus(post.status);

      if (post.media.length > 0) {
        const existingMedia: LocalMediaItem[] = post.media
          .slice(0, MAX_POST_MEDIA_ITEMS)
          .map((m) => ({
            id: m.id,
            url: m.media_url,
            type: m.media_type,
            isNew: false,
          }));
        setMediaItems(existingMedia);
      } else {
        setMediaItems([]);
      }
    } else {
      // Reset for new post
      setMediaItems([]);
      setCaption("");
      setSubtitle("");
      setStatus("draft");
    }
    setError(null);
  }, [post, open]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      type ValidMeta = { file: File; type: "image" | "video" };
      const validMeta: ValidMeta[] = [];

      for (const file of files) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          setError("Only image and video files are allowed");
          continue;
        }

        if (file.size > 50 * 1024 * 1024) {
          setError("Files must be less than 50MB");
          continue;
        }

        validMeta.push({
          file,
          type: isVideo ? "video" : "image",
        });
      }

      setMediaItems((prev) => {
        const remaining = MAX_POST_MEDIA_ITEMS - prev.length;
        if (remaining <= 0) {
          if (validMeta.length > 0) {
            setError(`Maximum ${MAX_POST_MEDIA_ITEMS} media items per post`);
          }
          return prev;
        }

        const toAddMeta = validMeta.slice(0, remaining);
        const toAdd: LocalMediaItem[] = toAddMeta.map(({ file, type }) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          type,
          isNew: true,
        }));

        if (validMeta.length > toAddMeta.length) {
          setError(`Maximum ${MAX_POST_MEDIA_ITEMS} media items per post`);
        } else if (toAdd.length > 0) {
          setError(null);
        }

        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.isNew && item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    if (savePost.isPending) return;
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mediaItems.length === 0) {
      setError("Please add at least one image or video");
      return;
    }

    if (mediaItems.length > MAX_POST_MEDIA_ITEMS) {
      setError(`Maximum ${MAX_POST_MEDIA_ITEMS} media items per post`);
      return;
    }

    try {
      const postData = await savePost.mutateAsync({
        isEditing,
        post: post ?? undefined,
        profileId,
        nextPosition,
        caption,
        subtitle,
        status,
        mediaItems,
      });

      mediaItems.forEach((item) => {
        if (item.isNew && item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });

      onSave(postData);
      onOpenChange(false);
    } catch (err) {
      setError(formatSupabaseError(err));
    }
  };

  const handleDelete = async () => {
    if (!post || !onDelete) return;

    try {
      await deletePost.mutateAsync({ post, profileId });
      onDelete(post.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Cleanup blob URLs
      mediaItems.forEach((item) => {
        if (item.isNew && item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    }
    onOpenChange(isOpen);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && isBusy) return;
    handleClose(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        headerCloseDisabled={isBusy}
        onPointerDownOutside={(e) => {
          if (isBusy) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isBusy) e.preventDefault();
        }}
        headerTitle={isEditing ? "Edit Post" : "New Post"}
        headerDescription={
          isEditing
            ? "Update your post's media, caption, and settings."
            : "Add images or videos to create a new post."
        }
        headerLeading={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Media Grid */}
          <div className="space-y-2">
            <Label>Media</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="media-upload"
              disabled={isBusy}
            />

            <DndContext
              id={`post-form-media-dnd-${formDndId}`}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={mediaItems.map((m) => m.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-2">
                  {mediaItems.map((item) => (
                    <SortableMediaItem
                      key={item.id}
                      item={item}
                      disabled={isBusy}
                      onRemove={() => handleRemoveMedia(item.id)}
                    />
                  ))}

                  {mediaItems.length < MAX_POST_MEDIA_ITEMS &&
                    (savePost.isPending ? (
                      <div
                        className="flex aspect-square cursor-not-allowed flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 opacity-50"
                        aria-hidden
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add</span>
                      </div>
                    ) : (
                      <label
                        htmlFor="media-upload"
                        className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add</span>
                      </label>
                    ))}
                </div>
              </SortableContext>
            </DndContext>

            <p className="text-xs text-muted-foreground">
              Up to {MAX_POST_MEDIA_ITEMS} items. Drag to reorder. First item shows as cover.
            </p>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (optional)</Label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="subtitle"
                placeholder="Song name, location, or note..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="pl-9"
                disabled={isBusy}
              />
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              disabled={isBusy}
            />
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(["draft", "scheduled", "published"] as const).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={status === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatus(s)}
                    className="flex-1 capitalize"
                    disabled={isBusy}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isBusy}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {deletePost.isPending ? "Deleting..." : "Delete"}
            </Button>
          )}
          <div className="flex flex-1 gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isBusy}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isBusy || mediaItems.length === 0}
              className="flex-1 sm:flex-none"
            >
              {savePost.isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Post"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
