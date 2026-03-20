"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Post, PostMedia, LocalMediaItem } from "@/types/post";

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
}: {
  item: LocalMediaItem;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 cursor-grab rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
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
  const isEditing = !!post;
  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([]);
  const [caption, setCaption] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [status, setStatus] = useState<Post["status"]>("draft");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      // Load existing media
      if (post.media && post.media.length > 0) {
        const existingMedia: LocalMediaItem[] = post.media.map((m) => ({
          id: m.id,
          url: m.media_url,
          type: m.media_type,
          isNew: false,
        }));
        setMediaItems(existingMedia);
      } else if (post.image_url) {
        // Legacy single image support
        setMediaItems([
          {
            id: "legacy-" + post.id,
            url: post.image_url,
            type: "image",
            isNew: false,
          },
        ]);
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

      const validFiles: LocalMediaItem[] = [];

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

        const id = `new-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        validFiles.push({
          id,
          file,
          url: URL.createObjectURL(file),
          type: isVideo ? "video" : "image",
          isNew: true,
        });
      }

      if (validFiles.length > 0) {
        setMediaItems((prev) => [...prev, ...validFiles]);
        setError(null);
      }

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
    setLoading(true);
    setError(null);

    if (mediaItems.length === 0) {
      setError("Please add at least one image or video");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      let postId = post?.id;
      let postData: Post;

      // Create or update post
      if (isEditing && postId) {
        const { data, error: updateError } = await supabase
          .from("posts")
          .update({
            caption: caption || null,
            subtitle: subtitle || null,
            status,
            image_url: mediaItems[0]?.url || "", // Keep legacy field
            updated_at: new Date().toISOString(),
          })
          .eq("id", postId)
          .select()
          .single();

        if (updateError) throw updateError;
        postData = data as Post;
      } else {
        const { data, error: insertError } = await supabase
          .from("posts")
          .insert({
            profile_id: profileId,
            caption: caption || null,
            subtitle: subtitle || null,
            image_url: "", // Will be updated after media upload
            grid_position: nextPosition,
            status: "draft",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        postId = data.id;
        postData = data as Post;
      }

      // Handle media items
      const uploadedMedia: PostMedia[] = [];

      // Delete removed media items (for editing)
      if (isEditing && post?.media) {
        const currentIds = new Set(mediaItems.filter((m) => !m.isNew).map((m) => m.id));
        const toDelete = post.media.filter((m) => !currentIds.has(m.id));

        for (const media of toDelete) {
          // Delete from storage
          if (media.media_url.includes("/storage/v1/object/public/posts/")) {
            const path = media.media_url.split("/posts/")[1];
            if (path) {
              await supabase.storage.from("posts").remove([path]);
            }
          }
          // Delete from database
          await supabase.from("post_media").delete().eq("id", media.id);
        }
      }

      // Upload new media and update positions
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];

        if (item.isNew && item.file) {
          // Upload new file
          const fileExt = item.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${profileId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("posts")
            .upload(filePath, item.file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("posts")
            .getPublicUrl(filePath);

          // Insert media record
          const { data: mediaData, error: mediaError } = await supabase
            .from("post_media")
            .insert({
              post_id: postId,
              media_url: urlData.publicUrl,
              media_type: item.type,
              position: i,
            })
            .select()
            .single();

          if (mediaError) throw mediaError;
          uploadedMedia.push(mediaData as PostMedia);
        } else {
          // Update position for existing media
          const { data: mediaData, error: updateError } = await supabase
            .from("post_media")
            .update({ position: i })
            .eq("id", item.id)
            .select()
            .single();

          if (updateError) throw updateError;
          uploadedMedia.push(mediaData as PostMedia);
        }
      }

      // Update post's image_url with first media item
      if (uploadedMedia.length > 0) {
        const firstMedia = uploadedMedia.sort((a, b) => a.position - b.position)[0];
        await supabase
          .from("posts")
          .update({ image_url: firstMedia.media_url })
          .eq("id", postId);

        postData.image_url = firstMedia.media_url;
      }

      postData.media = uploadedMedia.sort((a, b) => a.position - b.position);

      // Cleanup blob URLs
      mediaItems.forEach((item) => {
        if (item.isNew && item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });

      onSave(postData);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !onDelete) return;
    setDeleting(true);

    const supabase = createClient();

    try {
      // Delete all media files from storage
      if (post.media) {
        for (const media of post.media) {
          if (media.media_url.includes("/storage/v1/object/public/posts/")) {
            const path = media.media_url.split("/posts/")[1];
            if (path) {
              await supabase.storage.from("posts").remove([path]);
            }
          }
        }
      }

      // Delete legacy image if exists
      if (post.image_url?.includes("/storage/v1/object/public/posts/")) {
        const path = post.image_url.split("/posts/")[1];
        if (path) {
          await supabase.storage.from("posts").remove([path]);
        }
      }

      // Delete post (cascades to post_media)
      await supabase.from("posts").delete().eq("id", post.id);

      onDelete(post.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeleting(false);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg"
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
            />

            <DndContext
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
                      onRemove={() => handleRemoveMedia(item.id)}
                    />
                  ))}

                  {/* Add more button */}
                  <label
                    htmlFor="media-upload"
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </label>
                </div>
              </SortableContext>
            </DndContext>

            <p className="text-xs text-muted-foreground">
              Drag to reorder. First item shows as cover.
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
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <div className="flex flex-1 gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || mediaItems.length === 0}
              className="flex-1 sm:flex-none"
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Post"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
