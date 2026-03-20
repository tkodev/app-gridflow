"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Trash2, Upload, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Post } from "./posts-grid";

export function PostDetailDialog({
  post,
  onClose,
  onUpdate,
  onDelete,
}: {
  post: Post | null;
  onClose: () => void;
  onUpdate: (post: Post) => void;
  onDelete: (postId: string) => void;
}) {
  const [caption, setCaption] = useState(post?.caption || "");
  const [status, setStatus] = useState(post?.status || "draft");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when post changes
  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      setStatus(post.status);
      setNewFile(null);
      setPreview(null);
      setError(null);
    }
  }, [post]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setNewFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async () => {
    if (!post) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    let newImageUrl = post.image_url;

    // If there's a new file, upload it
    if (newFile) {
      const fileExt = newFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${post.profile_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, newFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(filePath);

      newImageUrl = urlData.publicUrl;

      // Delete old image if it's from our storage
      if (post.image_url.includes("/storage/v1/object/public/posts/")) {
        const oldPath = post.image_url.split("/posts/")[1];
        if (oldPath) {
          await supabase.storage.from("posts").remove([oldPath]);
        }
      }
    }

    const { data, error: updateError } = await supabase
      .from("posts")
      .update({
        image_url: newImageUrl,
        caption: caption || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    if (data) {
      onUpdate(data as Post);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);

    const supabase = createClient();

    // Delete the image from storage if it's from our bucket
    if (post.image_url.includes("/storage/v1/object/public/posts/")) {
      const path = post.image_url.split("/posts/")[1];
      if (path) {
        await supabase.storage.from("posts").remove([path]);
      }
    }

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (!error) {
      onDelete(post.id);
    }
    setDeleting(false);
  };

  const displayImage = preview || post?.image_url;

  return (
    <Dialog open={!!post} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        {post && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-[var(--radius)] border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="edit-image-upload"
              />
              <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius)] bg-muted">
                {displayImage && (
                  <Image
                    src={displayImage}
                    alt={post.caption || "Post image"}
                    fill
                    className="object-cover"
                  />
                )}
                <label
                  htmlFor="edit-image-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                >
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">Change Image</span>
                  </div>
                </label>
              </div>
              {newFile && (
                <p className="text-xs text-muted-foreground">
                  New image selected: {newFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCaption">Caption</Label>
              <Textarea
                id="editCaption"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>

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
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
          <div className="flex flex-1 gap-2 sm:justify-end">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
