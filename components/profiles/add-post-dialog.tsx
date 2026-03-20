"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!imageUrl) {
      setError("Please enter an image URL");
      setLoading(false);
      return;
    }

    const supabase = createClient();

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
      setError(insertError.message);
      setLoading(false);
      return;
    }

    onAdd(data as Post);
    setImageUrl("");
    setCaption("");
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label htmlFor="imageUrl">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a direct link to your image
            </p>
          </div>

          {imageUrl && (
            <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius)] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={() => setError("Could not load image from URL")}
              />
            </div>
          )}

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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
