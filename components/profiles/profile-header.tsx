"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/profiles/edit-profile-dialog";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export function ProfileHeader({
  profile,
  postsCount,
}: {
  profile: Profile;
  postsCount: number;
}) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const displayName = profile.display_name || profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="mb-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20 md:h-24 md:w-24">
            <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{profile.username}</h1>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </div>

            <div className="mt-3 flex gap-6">
              <div className="text-center">
                <span className="font-semibold">{postsCount}</span>
                <span className="ml-1 text-muted-foreground">posts</span>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-3 text-sm">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      <EditProfileDialog
        profile={profile}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
