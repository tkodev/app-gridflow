"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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

  const displayName = profile.display_name || profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const showDisplayLine =
    Boolean(profile.display_name) && profile.display_name !== profile.username;

  const handleProfileSwitch = (profileId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("profile", profileId);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="space-y-4 border-b border-border pb-4">
      <div className="flex items-start gap-6">
        <Avatar className="size-34">
          <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2 text-left">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto min-h-0 w-fit justify-start gap-1.5 px-0 py-0 text-xl font-bold leading-none hover:bg-transparent data-[state=open]:bg-transparent"
              >
                {profile.username}
                <ChevronDown className="size-5 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => handleProfileSwitch(p.id)}
                  className="gap-2"
                >
                  <Avatar className="size-6">
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

          {showDisplayLine ? (
            <p className="text-base font-sm leading-snug">{profile.display_name}</p>
          ) : null}

          <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <span>
              <span className="font-bold">{postsCount.toLocaleString()}</span>{" "}
              <span className="font-normal text-muted-foreground">posts</span>
            </span>
            <span>
              <span className="font-bold">{Number(0).toLocaleString()}</span>{" "}
              <span className="font-normal text-muted-foreground">followers</span>
            </span>
            <span>
              <span className="font-bold">{Number(0).toLocaleString()}</span>{" "}
              <span className="font-normal text-muted-foreground">following</span>
            </span>
          </div>

          {profile.bio ? (
            <p className="whitespace-pre-wrap text-sm font-normal leading-snug text-muted-foreground">
              {profile.bio}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
