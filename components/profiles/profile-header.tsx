"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  profiles,
  postsCount,
}: {
  profile: Profile;
  profiles: Profile[];
  postsCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const displayName = profile.display_name || profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleProfileSwitch = (profileId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("profile", profileId);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <>
      <div className="mb-4">
        {/* Profile Dropdown as Title */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-xl font-semibold outline-none">
            {profile.username}
            <ChevronDown className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {profiles.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => handleProfileSwitch(p.id)}
                className="gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {(p.display_name || p.username).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{p.username}</span>
                {profile.id === p.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar and Stats Row */}
        <div className="mt-4 flex items-center gap-6">
          <Avatar className="h-20 w-20 md:h-24 md:w-24">
            <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-1 justify-around text-center">
            <div>
              <span className="block text-lg font-semibold">{postsCount}</span>
              <span className="text-sm text-muted-foreground">posts</span>
            </div>
          </div>
        </div>

        {/* Name and Bio */}
        <div className="mt-4">
          {profile.display_name && (
            <p className="font-semibold">{profile.display_name}</p>
          )}
          {profile.bio && (
            <p className="mt-1 text-sm">{profile.bio}</p>
          )}
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
