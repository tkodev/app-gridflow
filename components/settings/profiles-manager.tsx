"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, UserCircle, UserPlus, Key, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { Profile } from "@/types/profile";

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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    // Delete post images from storage
    const { data: postFiles } = await supabase.storage
      .from("posts")
      .list(profileToDelete.id);
    
    if (postFiles && postFiles.length > 0) {
      const postFilePaths = postFiles.map(f => `${profileToDelete.id}/${f.name}`);
      await supabase.storage.from("posts").remove(postFilePaths);
    }

    // Delete avatar from storage
    const { data: avatarFiles } = await supabase.storage
      .from("avatars")
      .list(profileToDelete.id);
    
    if (avatarFiles && avatarFiles.length > 0) {
      const avatarFilePaths = avatarFiles.map(f => `${profileToDelete.id}/${f.name}`);
      await supabase.storage.from("avatars").remove(avatarFilePaths);
    }

    // Delete profile (posts will cascade delete from DB)
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess("Password updated successfully");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
    setTimeout(() => {
      setShowPasswordDialog(false);
      setSuccess(null);
    }, 1500);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Get all profiles for this user
      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id);

      if (userProfiles && userProfiles.length > 0) {
        // Delete all storage files for each profile (posts and avatars)
        for (const profile of userProfiles) {
          // Delete post images from storage
          const { data: postFiles } = await supabase.storage
            .from("posts")
            .list(profile.id);
          
          if (postFiles && postFiles.length > 0) {
            const postFilePaths = postFiles.map(f => `${profile.id}/${f.name}`);
            await supabase.storage.from("posts").remove(postFilePaths);
          }

          // Delete avatar from storage
          const { data: avatarFiles } = await supabase.storage
            .from("avatars")
            .list(profile.id);
          
          if (avatarFiles && avatarFiles.length > 0) {
            const avatarFilePaths = avatarFiles.map(f => `${profile.id}/${f.name}`);
            await supabase.storage.from("avatars").remove(avatarFilePaths);
          }
        }
      }

      // Delete all profiles (posts will cascade delete)
      await supabase.from("profiles").delete().eq("user_id", user.id);
    }

    // Sign out and redirect
    await supabase.auth.signOut();
    router.push("/");
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordDialog(true)}
          >
            <Key className="mr-1.5 h-4 w-4" />
            Change Password
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 rounded-lg border border-destructive/50 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="font-semibold text-destructive">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteAccountDialog(true)}
        >
          Delete Account
        </Button>
      </div>

      {/* Add Profile Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="sm:max-w-md"
          headerTitle="Add New Profile"
          headerDescription="Create a new profile to manage a separate Instagram account."
          headerLeading={
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </div>
          }
        >
          <form onSubmit={handleAddProfile} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
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

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) {
          setError(null);
          setSuccess(null);
          setNewPassword("");
          setConfirmPassword("");
        }
      }}>
        <DialogContent
          className="sm:max-w-md"
          headerTitle="Change Password"
          headerDescription="Enter your new password below."
          headerLeading={
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Key className="h-4 w-4 text-muted-foreground" />
            </div>
          }
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Dialog */}
      <Dialog
        open={!!profileToDelete}
        onOpenChange={(open) => !open && setProfileToDelete(null)}
      >
        <DialogContent
          className="sm:max-w-md"
          headerTitle="Delete Profile"
          headerDescription={
            <>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{profileToDelete?.username}</span>?
              This will permanently delete all posts associated with this profile.
            </>
          }
        >
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

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteAccountDialog}
        onOpenChange={(open) => {
          setShowDeleteAccountDialog(open);
          if (!open) {
            setDeleteConfirmation("");
            setError(null);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          headerTitle="Delete Account"
          headerTitleClassName="text-destructive"
          headerDescription="This action cannot be undone. This will permanently delete your account, all your profiles, and all posts associated with them."
          headerLeading={
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          }
        >
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </Label>
              <Input
                id="deleteConfirmation"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAccountDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmation !== "DELETE"}
              >
                {loading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
