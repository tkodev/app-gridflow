"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "./posts-grid";

export function AddPostDialog({
  open,
  onOpenChange,
  onAdd,
  profileId,
  nextPosition,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (post: Post) => void;
  profileId: string;
  nextPosition: number;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!file) {
      setError("Please select an image");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${profileId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // Create post record
    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        profile_id: profileId,
        image_url: imageUrl,
        caption: caption || null,
        grid_position: nextPosition,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded file if post creation fails
      await supabase.storage.from("posts").remove([filePath]);
      setError(insertError.message);
      setLoading(false);
      return;
    }

    onAdd(data as Post);
    clearFile();
    setCaption("");
    setLoading(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      clearFile();
      setCaption("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              id="image-upload"
            />

            {!preview ? (
              <label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
              >
                <div className="rounded-full bg-background p-3">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or WEBP (max 5MB)
                  </p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius)] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={clearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-2 right-2"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="pointer-events-none"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Change
                  </Button>
                </label>
              </div>
            )}
          </div>

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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Uploading..." : "Add Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
