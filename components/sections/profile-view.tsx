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
  headerRow: cva('grid grid-cols-[1fr_2fr] items-start gap-x-4 gap-y-2 sm:grid-cols-[1fr_3fr]'),
  avatarCol: cva('w-full justify-self-start'),
  contentCol: cva('min-w-0 space-y-2'),

  usernameCell: cva('flex min-w-0 items-center justify-between gap-2'),
  nameCell: cva('text-base leading-snug font-normal'),
  statsCell: cva('flex flex-wrap justify-start gap-x-4 gap-y-1 text-sm sm:gap-x-6'),
  bioCell: cva(
    'text-muted-foreground min-w-0 text-sm leading-snug font-normal whitespace-pre-wrap'
  ),

  avatar: cva('aspect-square h-auto w-full max-w-none shrink-0'),
  avatarFallback: cva('text-lg'),
  triggerButton: cva(
    'h-auto min-h-0 w-fit justify-start gap-1.5 px-0 py-0 text-xl leading-none font-bold hover:bg-transparent data-[state=open]:bg-transparent'
  ),
  menuContent: cva('w-56'),
  menuItem: cva('gap-2'),
  menuAvatar: cva('size-6'),
  menuAvatarFallback: cva('text-xs'),
  menuName: cva('flex-1 truncate'),
  statItem: cva('flex flex-col sm:flex-row sm:items-end sm:gap-1'),
  statValue: cva('font-bold'),
  statLabel: cva('text-muted-foreground text-xs'),
  nameLabel: cva('flex w-fit items-center rounded-sm py-1.5 text-xl leading-none font-bold')
}

// 2. types
type ProfileViewProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    profile: Profile
    profiles: Profile[]
    postsCount: number
    /** When true, show the username as plain text (no profile switcher dropdown). */
    nameOnly?: boolean
  }

// 3. component
const ProfileView: React.FC<ProfileViewProps> = (props) => {
  // a. props
  const { profile, profiles, postsCount, nameOnly = false, className, ...rest } = props

  // b. hooks
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // c. logic
  const name = profile.display_name || profile.username
  const initials = name.slice(0, 2).toUpperCase()
  const showName = Boolean(profile.display_name) && profile.display_name !== profile.username

  const handleProfileSwitch = (profileId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('profile', profileId)
    router.push(`${pathname}?${params.toString()}`)
    router.refresh()
  }

  // d. component
  return (
    <div className={cn(styles.root({ className }))} {...rest}>
      <div className={styles.headerRow()}>
        <div className={styles.avatarCol()}>
          <Avatar className={styles.avatar()}>
            <AvatarImage alt={name} src={profile.avatar_url || undefined} />
            <AvatarFallback className={styles.avatarFallback()}>{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className={styles.contentCol()}>
          <div className={styles.usernameCell()}>
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
          </div>
          {showName ? <p className={cn(styles.nameCell())}>{profile.display_name}</p> : null}
          <div className={styles.statsCell()}>
            <span className={styles.statItem()}>
              <span className={styles.statValue()}>{postsCount.toLocaleString()}</span>
              <span className={styles.statLabel()}>posts</span>
            </span>
            <span className={styles.statItem()}>
              <span className={styles.statValue()}>{Number(0).toLocaleString()}</span>
              <span className={styles.statLabel()}>followers</span>
            </span>
            <span className={styles.statItem()}>
              <span className={styles.statValue()}>{Number(0).toLocaleString()}</span>
              <span className={styles.statLabel()}>following</span>
            </span>
          </div>
          <p className={styles.bioCell()}>{profile.bio}</p>
        </div>
      </div>
    </div>
  )
}

// 4. exports
export { ProfileView }
