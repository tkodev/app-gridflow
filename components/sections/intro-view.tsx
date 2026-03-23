'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, Pencil, Settings } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
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
import { ProfileEditDialog } from '@/components/organisms/profile-edit-dialog'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('border-border space-y-4 border-b pb-4'),
  headerRow: cva('grid grid-cols-[1fr_2fr] items-start gap-x-4 gap-y-2 sm:grid-cols-[1fr_3fr]'),
  avatarCol: cva('w-full justify-self-start'),
  contentCol: cva('min-w-0 space-y-2'),

  usernameCell: cva('flex min-w-0 items-center gap-2'),
  nameLabelButton: cva('pl-0'),
  nameCell: cva('text-base leading-snug font-normal'),
  statsCell: cva('flex flex-wrap justify-start gap-x-4 gap-y-1 text-sm sm:gap-x-6'),
  bioCell: cva(
    'text-muted-foreground min-w-0 text-sm leading-snug font-normal whitespace-pre-wrap'
  ),

  avatar: cva('aspect-square h-auto w-full max-w-none shrink-0'),
  avatarFallback: cva('text-lg'),
  srOnly: cva('sr-only'),
  menuContent: cva('w-56'),
  menuItem: cva('gap-2'),
  menuAvatar: cva('size-6'),
  menuAvatarFallback: cva('text-xs'),
  menuName: cva('flex-1 truncate'),
  menuSettingsIcon: cva('mr-2'),
  dropdownChevron: cva('shrink-0 opacity-50'),
  statItem: cva('flex flex-col sm:flex-row sm:items-end sm:gap-1'),
  statValue: cva('font-bold'),
  statLabel: cva('text-muted-foreground text-xs'),
  nameLabel: cva('flex w-fit items-center rounded-sm py-1.5 text-xl leading-none font-bold')
}

// 2. types
type IntroViewProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    profile: Profile
    profiles: Profile[]
    postsCount: number
    /** When true, show the username as plain text (no profile switcher or edit). */
    readOnly?: boolean
  }

// 3. component
const IntroView: React.FC<IntroViewProps> = (props) => {
  // a. props
  const { profile, profiles, postsCount, readOnly = false, className, ...rest } = props

  // b. hooks
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
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
          {profile.id === p.id && <Icon icon={Check} size="sm" />}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/settings">
          <Icon className={styles.menuSettingsIcon()} icon={Settings} size="sm" />
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
            <div className={cn(styles.usernameCell())}>
              {readOnly ? (
                <p className={styles.nameLabel()}>{profile.username}</p>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        className={cn(styles.nameLabel(), styles.nameLabelButton())}
                        size="lg"
                        variant="ghost"
                      >
                        <span>{profile.username}</span>
                        <Icon className={styles.dropdownChevron()} icon={ChevronDown} size="sm" />
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
                    <Icon icon={Pencil} size="sm" />
                    <span className={styles.srOnly()}>Edit profile</span>
                  </Button>
                </>
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
export { IntroView }
