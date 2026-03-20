"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Grid3X3, Settings, LogOut, Moon, Sun, ChevronDown, Plus, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export function AppHeader({ user, profiles }: { user: User; profiles: Profile[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Get current profile from URL or default to first profile
  const currentProfileId = searchParams.get("profile");
  const currentProfile = currentProfileId 
    ? profiles.find(p => p.id === currentProfileId) 
    : profiles[0];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleProfileSwitch = (profileId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("profile", profileId);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  const displayName = currentProfile?.display_name || currentProfile?.username || "Select Profile";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/profiles" className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          <span className="font-bold">GridFlow</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Profile Switcher */}
          {profiles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={currentProfile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-24 truncate text-sm">
                    {currentProfile?.username || "Profile"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profiles.map((profile) => (
                  <DropdownMenuItem
                    key={profile.id}
                    onClick={() => handleProfileSwitch(profile.id)}
                    className="gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {(profile.display_name || profile.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate">{profile.username}</span>
                    {currentProfile?.id === profile.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Manage Profiles
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
