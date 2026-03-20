"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export function ProfileHeader({
  profile,
  postsCount,
}: {
  profile: Profile | null;
  postsCount: number;
}) {
  const displayName = profile?.display_name || profile?.username || "User";
  const username = profile?.username || "user";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="mb-6">
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20 md:h-24 md:w-24">
          <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{username}</h1>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                Edit Profile
              </Link>
            </Button>
          </div>

          <div className="mt-3 flex gap-6">
            <div className="text-center">
              <span className="font-semibold">{postsCount}</span>
              <span className="ml-1 text-muted-foreground">posts</span>
            </div>
          </div>

          {profile?.bio && (
            <p className="mt-3 text-sm">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
