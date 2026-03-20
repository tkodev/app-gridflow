"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset state when post changes
  if (post && caption !== post.caption) {
    setCaption(post.caption || "");
    setStatus(post.status);
  }

  const handleSave = async () => {
    if (!post) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .update({
        caption: caption || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id)
      .select()
      .single();

    if (!error && data) {
      onUpdate(data as Post);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (!error) {
      onDelete(post.id);
    }
    setDeleting(false);
  };

  return (
    <Dialog open={!!post} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        {post && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius)] bg-muted">
              <Image
                src={post.image_url}
                alt={post.caption || "Post image"}
                fill
                className="object-cover"
              />
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
