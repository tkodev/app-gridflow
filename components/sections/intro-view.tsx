'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
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
import { ProfileEditDialog } from '@/components/organisms/profile-edit-dialog'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('space-y-4 pb-4'),
  headerRow: cva('flex items-start gap-4'),
  avatarCol: cva('shrink-0'),
  contentCol: cva('min-w-0 flex-1 space-y-2'),

  usernameRow: cva('flex min-w-0 items-center gap-2'),
  usernameLabel: cva('font-serif text-xl leading-none font-bold italic'),
  usernameLabelButton: cva('-ml-2.5'),
  displayName: cva('text-muted-foreground text-sm'),
  statsRow: cva('flex flex-wrap gap-x-6 gap-y-1 text-sm'),
  bioText: cva(
    'text-muted-foreground min-w-0 text-sm leading-snug font-normal whitespace-pre-wrap'
  ),

  avatar: cva('size-20 sm:size-24'),
  avatarFallback: cva('text-lg'),
  srOnly: cva('sr-only'),
  menuContent: cva('w-56'),
  menuItem: cva('gap-2'),
  menuAvatar: cva('size-6'),
  menuAvatarFallback: cva('text-xs'),
  menuName: cva('flex-1 truncate'),
  menuSettingsIcon: cva('mr-2'),
  dropdownChevron: cva('shrink-0 opacity-50'),
  statItem: cva('flex items-end gap-1'),
  statValue: cva('text-base font-bold'),
  statLabel: cva('text-muted-foreground text-xs tracking-wide uppercase')
}

// 2. types
type IntroViewProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    profile: Profile
    profiles: Profile[]
    posts: Post[]
    /** When true, show the username as plain text (no profile switcher or edit). */
    readOnly?: boolean
  }

// 3. component
const IntroView: React.FC<IntroViewProps> = (props) => {
  // a. props
  const { profile, profiles, posts, readOnly = false, className, ...rest } = props

  // b. hooks
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // c. logic
  const name = profile.display_name || profile.username
  const initials = name.slice(0, 2).toUpperCase()

  const totalPosts = posts.length
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length
  const draftCount = posts.filter((p) => p.status === 'draft').length

  const handleProfileSwitch = (profileId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('profile', profileId)
    router.push(`${pathname}?${params.toString()}`)
    router.refresh()
  }

  const profileSwitcherMenu = (
    <>
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
          {profile.id === p.id && <Icon name="check" size="sm" />}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/settings">
          <Icon name="settings" className={styles.menuSettingsIcon()} size="sm" />
          Manage profiles
        </Link>
      </DropdownMenuItem>
    </>
  )

  // d. component
  return (
    <>
      <div className={cn(styles.root({ className }))} {...rest}>
        <div className={styles.headerRow()}>
          <div className={styles.avatarCol()}>
            <Avatar className={styles.avatar()}>
              <AvatarImage alt={name} src={profile.avatar_url || undefined} />
              <AvatarFallback className={styles.avatarFallback()}>{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className={styles.contentCol()}>
            <div className={styles.usernameRow()}>
              {readOnly ? (
                <p className={styles.usernameLabel()}>@{profile.username}</p>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        className={cn(styles.usernameLabel(), styles.usernameLabelButton())}
                        size="lg"
                        variant="ghost"
                      >
                        <span>@{profile.username}</span>
                        <Icon name="chevronDown" className={styles.dropdownChevron()} size="sm" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={styles.menuContent()} align="start">
                      {profileSwitcherMenu}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => setShowEditProfileDialog(true)}
                  >
                    <Icon name="pencil" size="sm" />
                    <span className={styles.srOnly()}>Edit profile</span>
                  </Button>
                </>
              )}
            </div>
            {profile.display_name ? (
              <p className={styles.displayName()}>{profile.display_name}</p>
            ) : null}
            <div className={styles.statsRow()}>
              <span className={styles.statItem()}>
                <span className={styles.statValue()}>{totalPosts}</span>
                <span className={styles.statLabel()}>Posts</span>
              </span>
              <span className={styles.statItem()}>
                <span className={styles.statValue()}>{scheduledCount}</span>
                <span className={styles.statLabel()}>Scheduled</span>
              </span>
              <span className={styles.statItem()}>
                <span className={styles.statValue()}>{draftCount}</span>
                <span className={styles.statLabel()}>Drafts</span>
              </span>
            </div>
            {profile.bio ? <p className={styles.bioText()}>{profile.bio}</p> : null}
          </div>
        </div>
      </div>
      {!readOnly ? (
        <ProfileEditDialog
          open={showEditProfileDialog}
          profile={profile}
          onOpenChange={setShowEditProfileDialog}
        />
      ) : null}
    </>
  )
}

// 4. exports
export type { IntroViewProps }
export { IntroView }
