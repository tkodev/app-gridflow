'use client'

import { useRouter } from 'next/navigation'
import { Camera, Upload, UserRound, X } from 'lucide-react'
import { startTransition, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateProfileMutation } from '@/queries/profile'

type ProfileEditFormValues = {
  username: string
  displayName: string
  bio: string
  gridRatio: Profile['grid_ratio']
}

export const ProfileEditDialog = ({
  profile,
  open,
  onOpenChange
}: {
  profile: Profile
  open: boolean
  onOpenChange: (open: boolean) => void
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
        className="sm:max-w-md"
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
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
            <UserRound className="text-muted-foreground h-4 w-4" />
          </div>
        }
      >
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <input type="hidden" {...register('gridRatio')} />
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl">{username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 rounded-full p-2 shadow-lg disabled:pointer-events-none disabled:opacity-50"
                disabled={updateProfile.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              disabled={updateProfile.isPending}
              onChange={handleFileSelect}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                disabled={updateProfile.isPending}
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-4 w-4" />
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
                  <X className="mr-1.5 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {(errors.root?.message || errors.username) && (
            <p className="text-destructive text-center text-sm">
              {errors.root?.message || errors.username?.message}
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                aria-invalid={!!errors.username}
                disabled={updateProfile.isPending}
                placeholder="username"
                {...register('username', { required: 'Username is required' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                disabled={updateProfile.isPending}
                placeholder="Your Name"
                {...register('displayName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                disabled={updateProfile.isPending}
                placeholder="Tell us about yourself..."
                rows={3}
                {...register('bio')}
              />
            </div>

            <div className="space-y-2">
              <Label>Grid Ratio</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  disabled={updateProfile.isPending}
                  variant={gridRatio === 'square' ? 'default' : 'outline'}
                  onClick={() => setValue('gridRatio', 'square')}
                >
                  <div className="mr-2 h-4 w-4 border-2 border-current" />
                  Square (1:1)
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={updateProfile.isPending}
                  variant={gridRatio === 'portrait' ? 'default' : 'outline'}
                  onClick={() => setValue('gridRatio', 'portrait')}
                >
                  <div className="mr-2 h-5 w-4 border-2 border-current" />
                  Portrait (4:5)
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Choose how images appear in your grid preview
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              className="flex-1"
              disabled={updateProfile.isPending}
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
