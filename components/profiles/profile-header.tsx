'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, Settings } from 'lucide-react'
import type { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export const ProfileHeader = ({
  profile,
  profiles,
  postsCount
}: {
  profile: Profile
  profiles: Profile[]
  postsCount: number
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const displayName = profile.display_name || profile.username
  const initials = displayName.slice(0, 2).toUpperCase()
  const showDisplayLine = Boolean(profile.display_name) && profile.display_name !== profile.username

  const handleProfileSwitch = (profileId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('profile', profileId)
    router.push(`${pathname}?${params.toString()}`)
    router.refresh()
  }

  return (
    <div className="border-border space-y-4 border-b pb-4">
      <div className="flex items-start gap-6">
        <Avatar className="size-34">
          <AvatarImage alt={displayName} src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2 text-left">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-auto min-h-0 w-fit justify-start gap-1.5 px-0 py-0 text-xl leading-none font-bold hover:bg-transparent data-[state=open]:bg-transparent"
                variant="ghost"
              >
                {profile.username}
                <ChevronDown className="size-5 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="gap-2"
                  onClick={() => handleProfileSwitch(p.id)}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage profiles
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {showDisplayLine ? (
            <p className="font-sm text-base leading-snug">{profile.display_name}</p>
          ) : null}

          <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <span>
              <span className="font-bold">{postsCount.toLocaleString()}</span>{' '}
              <span className="text-muted-foreground font-normal">posts</span>
            </span>
            <span>
              <span className="font-bold">{Number(0).toLocaleString()}</span>{' '}
              <span className="text-muted-foreground font-normal">followers</span>
            </span>
            <span>
              <span className="font-bold">{Number(0).toLocaleString()}</span>{' '}
              <span className="text-muted-foreground font-normal">following</span>
            </span>
          </div>

          {profile.bio ? (
            <p className="text-muted-foreground text-sm leading-snug font-normal whitespace-pre-wrap">
              {profile.bio}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
