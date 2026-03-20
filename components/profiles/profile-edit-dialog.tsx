"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, X, UserRound } from "lucide-react";
import { useUpdateProfileMutation } from "@/queries/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Profile } from "@/types/profile";

export function ProfileEditDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [gridRatio, setGridRatio] = useState<Profile["grid_ratio"]>(profile.grid_ratio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [error, setError] = useState<string | null>(null);
  const updateProfile = useUpdateProfileMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateProfile.mutateAsync({
        profileId: profile.id,
        username,
        displayName,
        bio,
        gridRatio,
        existingAvatarUrl: profile.avatar_url,
        newAvatarFile: avatarFile,
        removeStoredAvatar:
          avatarPreview === null && !!profile.avatar_url,
      });

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && updateProfile.isPending) return;
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        headerTitle="Edit Profile"
        headerDescription="Edit your profile details and how posts appear in the grid."
        headerCloseDisabled={updateProfile.isPending}
        onPointerDownOutside={(e) => {
          if (updateProfile.isPending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (updateProfile.isPending) e.preventDefault();
        }}
        headerLeading={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl">
                  {username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={updateProfile.isPending}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={updateProfile.isPending}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={updateProfile.isPending}
              >
                <Upload className="mr-1.5 h-4 w-4" />
                Upload Photo
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeAvatar}
                  disabled={updateProfile.isPending}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
                disabled={updateProfile.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                disabled={updateProfile.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                disabled={updateProfile.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>Grid Ratio</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={gridRatio === "square" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setGridRatio("square")}
                  disabled={updateProfile.isPending}
                >
                  <div className="mr-2 h-4 w-4 border-2 border-current" />
                  Square (1:1)
                </Button>
                <Button
                  type="button"
                  variant={gridRatio === "portrait" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setGridRatio("portrait")}
                  disabled={updateProfile.isPending}
                >
                  <div className="mr-2 h-5 w-4 border-2 border-current" />
                  Portrait (4:5)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose how images appear in your grid preview
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={updateProfile.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
