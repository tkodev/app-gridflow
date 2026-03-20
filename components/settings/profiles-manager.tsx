"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export function ProfilesManager({
  profiles: initialProfiles,
  userEmail,
}: {
  profiles: Profile[];
  userEmail: string;
}) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!newUsername.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        username: newUsername.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.message.includes("duplicate")) {
        setError("This username is already taken");
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    setProfiles((prev) => [...prev, data as Profile]);
    setNewUsername("");
    setShowAddDialog(false);
    setLoading(false);
    router.refresh();
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;

    setLoading(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileToDelete.id);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id));
    setProfileToDelete(null);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profiles">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to profiles</span>
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">Back to profiles</span>
      </div>

      {/* Account Info */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Account</h2>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={userEmail}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>
      </div>

      {/* Profiles List */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Profiles</h2>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Profile
          </Button>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <UserCircle className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No profiles yet. Add your first profile to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {(profile.display_name || profile.username)
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.username}</p>
                    {profile.display_name && (
                      <p className="text-sm text-muted-foreground">
                        {profile.display_name}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setProfileToDelete(profile)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete profile</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Profile Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Profile</DialogTitle>
            <DialogDescription>
              Create a new profile to manage a separate Instagram account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddProfile} className="space-y-4">
            {error && (
              <div className="rounded-[var(--radius)] border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newUsername">Username</Label>
              <Input
                id="newUsername"
                type="text"
                placeholder="your_username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!profileToDelete}
        onOpenChange={(open) => !open && setProfileToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{profileToDelete?.username}</span>?
              This will permanently delete all posts associated with this profile.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setProfileToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProfile}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
