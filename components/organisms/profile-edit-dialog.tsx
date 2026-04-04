'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { startTransition, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { cva } from 'class-variance-authority'
import type { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import { Icon } from '@/components/atoms/icon'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Textarea } from '@/components/atoms/textarea'
import { useUpdateProfileMutation } from '@/queries/profile'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  dialogContent: cva('sm:max-w-md'),
  headerLeading: cva('bg-muted flex size-8 items-center justify-center rounded-full'),
  form: cva('space-y-6'),
  avatarBlock: cva('flex flex-col items-center gap-4'),
  avatarWrap: cva('relative'),
  avatar: cva('size-24'),
  avatarFallback: cva('text-2xl'),
  cameraButton: cva(
    'bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 rounded-full p-2 shadow-lg disabled:pointer-events-none disabled:opacity-50'
  ),
  hiddenFileInput: cva('hidden'),
  avatarActions: cva('flex gap-2'),
  errorText: cva('text-destructive text-center text-sm'),
  fields: cva('space-y-4'),
  fieldGroup: cva('space-y-2'),
  gridRow: cva('flex gap-2'),
  gridOptionButton: cva('flex-1'),
  ratioSquare: cva('mr-2 size-4 border-2 border-current'),
  ratioPortrait: cva('mr-2 h-5 w-4 border-2 border-current'),
  gridHint: cva('text-muted-foreground text-xs'),
  footer: cva('flex gap-3'),
  footerButton: cva('flex-1'),
  buttonIconLeading: cva('mr-1.5')
}

// 2. types
type ProfileEditFormValues = {
  username: string
  displayName: string
  bio: string
  gridRatio: Profile['grid_ratio']
}

type ProfileEditDialogProps = {
  profile: Profile
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

// 3. component
const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  profile,
  open,
  onOpenChange,
  className
}) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const updateProfile = useUpdateProfileMutation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors }
  } = useForm<ProfileEditFormValues>({
    defaultValues: {
      username: profile.username,
      displayName: profile.display_name || '',
      bio: profile.bio || '',
      gridRatio: profile.grid_ratio
    }
  })

  const username = useWatch({ control, name: 'username' })
  const gridRatio = useWatch({ control, name: 'gridRatio' })

  useEffect(() => {
    reset({
      username: profile.username,
      displayName: profile.display_name || '',
      bio: profile.bio || '',
      gridRatio: profile.grid_ratio
    })
    startTransition(() => {
      setAvatarFile(null)
      setAvatarPreview(profile.avatar_url)
    })
  }, [profile, open, reset])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('root', { message: 'Please select an image file' })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('root', { message: 'Image must be less than 2MB' })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    clearErrors('root')
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProfile.mutateAsync({
        profileId: profile.id,
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        gridRatio: data.gridRatio,
        existingAvatarUrl: profile.avatar_url,
        newAvatarFile: avatarFile,
        removeStoredAvatar: avatarPreview === null && !!profile.avatar_url
      })

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update profile'
      })
    }
  })

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && updateProfile.isPending) return
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className={cn(styles.dialogContent({ className }))}
        headerCloseDisabled={updateProfile.isPending}
        headerDescription="Edit your profile details and how posts appear in the grid."
        headerTitle="Edit Profile"
        onEscapeKeyDown={(e) => {
          if (updateProfile.isPending) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (updateProfile.isPending) e.preventDefault()
        }}
        headerLeading={
          <div className={styles.headerLeading()}>
            <Icon name="userRound" size="sm" tone="muted" />
          </div>
        }
      >
        <form className={styles.form()} onSubmit={onSubmit} noValidate>
          <input type="hidden" {...register('gridRatio')} />
          <div className={styles.avatarBlock()}>
            <div className={styles.avatarWrap()}>
              <Avatar className={styles.avatar()}>
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className={styles.avatarFallback()}>
                  {username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className={styles.cameraButton()}
                disabled={updateProfile.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="camera" size="sm" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.hiddenFileInput()}
              accept="image/*"
              disabled={updateProfile.isPending}
              onChange={handleFileSelect}
            />
            <div className={styles.avatarActions()}>
              <Button
                type="button"
                disabled={updateProfile.isPending}
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="upload" className={styles.buttonIconLeading()} size="sm" />
                Upload Photo
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  disabled={updateProfile.isPending}
                  size="sm"
                  variant="outline"
                  onClick={removeAvatar}
                >
                  <Icon name="x" className={styles.buttonIconLeading()} size="sm" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {(errors.root?.message || errors.username) && (
            <p className={styles.errorText()}>{errors.root?.message || errors.username?.message}</p>
          )}

          <div className={styles.fields()}>
            <div className={styles.fieldGroup()}>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                aria-invalid={!!errors.username}
                disabled={updateProfile.isPending}
                placeholder="username"
                {...register('username', { required: 'Username is required' })}
              />
            </div>

            <div className={styles.fieldGroup()}>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                disabled={updateProfile.isPending}
                placeholder="Your Name"
                {...register('displayName')}
              />
            </div>

            <div className={styles.fieldGroup()}>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                disabled={updateProfile.isPending}
                placeholder="Tell us about yourself..."
                rows={3}
                {...register('bio')}
              />
            </div>

            <div className={styles.fieldGroup()}>
              <Label>Grid Ratio</Label>
              <div className={styles.gridRow()}>
                <Button
                  type="button"
                  className={styles.gridOptionButton()}
                  disabled={updateProfile.isPending}
                  variant={gridRatio === 'square' ? 'default' : 'outline'}
                  onClick={() => setValue('gridRatio', 'square')}
                >
                  <div className={styles.ratioSquare()} />
                  Square (1:1)
                </Button>
                <Button
                  type="button"
                  className={styles.gridOptionButton()}
                  disabled={updateProfile.isPending}
                  variant={gridRatio === 'portrait' ? 'default' : 'outline'}
                  onClick={() => setValue('gridRatio', 'portrait')}
                >
                  <div className={styles.ratioPortrait()} />
                  Portrait (4:5)
                </Button>
              </div>
              <p className={styles.gridHint()}>Choose how images appear in your grid preview</p>
            </div>
          </div>

          <div className={styles.footer()}>
            <Button
              type="button"
              className={styles.footerButton()}
              disabled={updateProfile.isPending}
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={styles.footerButton()}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// 4. exports
export type { ProfileEditDialogProps }
export { ProfileEditDialog }
