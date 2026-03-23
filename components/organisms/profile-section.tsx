'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, Settings } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/atoms/dropdown'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('border-border space-y-4 border-b pb-4'),
  row: cva('flex items-start gap-6'),
  avatar: cva('size-34'),
  avatarFallback: cva('text-2xl'),
  mainCol: cva('min-w-0 flex-1 space-y-2 text-left'),
  triggerButton: cva(
    'h-auto min-h-0 w-fit justify-start gap-1.5 px-0 py-0 text-xl leading-none font-bold hover:bg-transparent data-[state=open]:bg-transparent'
  ),
  menuContent: cva('w-56'),
  menuItem: cva('gap-2'),
  menuAvatar: cva('size-6'),
  menuAvatarFallback: cva('text-xs'),
  menuName: cva('flex-1 truncate'),
  displayNameLine: cva('font-sm text-base leading-snug'),
  stats: cva('flex flex-wrap gap-x-8 gap-y-1 text-sm'),
  statValue: cva('font-bold'),
  statLabel: cva('text-muted-foreground font-normal'),
  bio: cva('text-muted-foreground text-sm leading-snug font-normal whitespace-pre-wrap'),
  nameLabel: cva('flex w-fit items-center rounded-sm py-1.5 text-xl leading-none font-bold')
}

// 2. types
type ProfileSectionProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    profile: Profile
    profiles: Profile[]
    postsCount: number
    /** When true, show the username as plain text (no profile switcher dropdown). */
    nameOnly?: boolean
  }

// 3. component
const ProfileSection: React.FC<ProfileSectionProps> = (props) => {
  // a. props
  const { profile, profiles, postsCount, nameOnly = false, className, ...rest } = props

  // b. hooks
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // c. logic
  const displayName = profile.display_name || profile.username
  const initials = displayName.slice(0, 2).toUpperCase()
  const showDisplayLine = Boolean(profile.display_name) && profile.display_name !== profile.username

  const handleProfileSwitch = (profileId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('profile', profileId)
    router.push(`${pathname}?${params.toString()}`)
    router.refresh()
  }

  // d. component
  return (
    <div className={cn(styles.root({ className }))} {...rest}>
      <div className={styles.row()}>
        <Avatar className={styles.avatar()}>
          <AvatarImage alt={displayName} src={profile.avatar_url || undefined} />
          <AvatarFallback className={styles.avatarFallback()}>{initials}</AvatarFallback>
        </Avatar>
        <div className={styles.mainCol()}>
          {nameOnly ? (
            <p className={styles.nameLabel()}>{profile.username}</p>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className={styles.triggerButton()} variant="ghost">
                  {profile.username}
                  <Icon icon={ChevronDown} size="md" tone="chevron" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={styles.menuContent()} align="start">
                {profiles.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    className={styles.menuItem()}
                    onClick={() => handleProfileSwitch(p.id)}
                  >
                    <Avatar className={styles.menuAvatar()}>
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback className={styles.menuAvatarFallback()}>
                        {(p.display_name || p.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className={styles.menuName()}>{p.username}</span>
                    {profile.id === p.id && <Icon icon={Check} size="sm" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Icon icon={Settings} size="sm" tone="menuItemLeading" />
                    Manage profiles
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showDisplayLine ? (
            <p className={styles.displayNameLine()}>{profile.display_name}</p>
          ) : null}

          <div className={styles.stats()}>
            <span>
              <span className={styles.statValue()}>{postsCount.toLocaleString()}</span>{' '}
              <span className={styles.statLabel()}>posts</span>
            </span>
            <span>
              <span className={styles.statValue()}>{Number(0).toLocaleString()}</span>{' '}
              <span className={styles.statLabel()}>followers</span>
            </span>
            <span>
              <span className={styles.statValue()}>{Number(0).toLocaleString()}</span>{' '}
              <span className={styles.statLabel()}>following</span>
            </span>
          </div>

          {profile.bio ? <p className={styles.bio()}>{profile.bio}</p> : null}
        </div>
      </div>
    </div>
  )
}

// 4. exports
export { ProfileSection }
