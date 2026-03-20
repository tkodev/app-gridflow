'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Key, Plus, Trash2, UserCircle, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAddProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useDeleteProfileMutation
} from '@/queries/settings-profiles'

type AddProfileFormValues = {
  username: string
}

type PasswordFormValues = {
  newPassword: string
  confirmPassword: string
}

type DeleteAccountFormValues = {
  confirmation: string
}

export const ProfilesManager = ({
  profiles: initialProfiles,
  userEmail
}: {
  profiles: Profile[]
  userEmail: string
}) => {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)
  const [deleteProfileError, setDeleteProfileError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const addProfile = useAddProfileMutation()
  const deleteProfile = useDeleteProfileMutation()
  const changePassword = useChangePasswordMutation()
  const deleteAccount = useDeleteAccountMutation()

  const addForm = useForm<AddProfileFormValues>({
    defaultValues: { username: '' }
  })

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { newPassword: '', confirmPassword: '' }
  })

  const deleteAccountForm = useForm<DeleteAccountFormValues>({
    defaultValues: { confirmation: '' }
  })

  const deleteConfirmationWatch = useWatch({
    control: deleteAccountForm.control,
    name: 'confirmation'
  })

  const onAddSubmit = addForm.handleSubmit(async (data) => {
    addForm.clearErrors('root')
    try {
      const created = await addProfile.mutateAsync({
        username: data.username.trim()
      })
      setProfiles((prev) => [...prev, created])
      addForm.reset()
      setShowAddDialog(false)
      router.refresh()
    } catch (err) {
      addForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create profile'
      })
    }
  })

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return
    setDeleteProfileError(null)
    try {
      await deleteProfile.mutateAsync({ profile: profileToDelete })
      setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id))
      setProfileToDelete(null)
      router.refresh()
    } catch (err) {
      setDeleteProfileError(err instanceof Error ? err.message : 'Failed to delete profile')
    }
  }

  const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
    passwordForm.clearErrors('root')
    setSuccess(null)
    try {
      await changePassword.mutateAsync({ newPassword: data.newPassword })
      setSuccess('Password updated successfully')
      passwordForm.reset()
      setTimeout(() => {
        setShowPasswordDialog(false)
        setSuccess(null)
      }, 1500)
    } catch (err) {
      passwordForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update password'
      })
    }
  })

  const onDeleteAccountSubmit = deleteAccountForm.handleSubmit(async () => {
    deleteAccountForm.clearErrors('root')
    try {
      await deleteAccount.mutateAsync()
      router.push('/')
      router.refresh()
    } catch (err) {
      deleteAccountForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to delete account'
      })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" asChild>
          <Link href="/profiles">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to profiles</span>
          </Link>
        </Button>
        <span className="text-muted-foreground text-sm">Back to profiles</span>
      </div>

      {/* Profiles List */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Profiles</h2>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Profile
          </Button>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <UserCircle className="text-muted-foreground h-12 w-12" />
            <p className="text-muted-foreground mt-2 text-sm">
              No profiles yet. Add your first profile to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {(profile.display_name || profile.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.username}</p>
                    {profile.display_name && (
                      <p className="text-muted-foreground text-sm">{profile.display_name}</p>
                    )}
                  </div>
                </div>
                <Button
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setDeleteProfileError(null)
                    setProfileToDelete(profile)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete profile</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Account</h2>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" className="bg-muted" value={userEmail} disabled />
          <p className="text-muted-foreground text-xs">Email cannot be changed</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowPasswordDialog(true)}>
            <Key className="mr-1.5 h-4 w-4" />
            Change Password
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-destructive/50 space-y-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-destructive h-5 w-5" />
          <h2 className="text-destructive font-semibold">Danger Zone</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button size="sm" variant="destructive" onClick={() => setShowDeleteAccountDialog(true)}>
          Delete Account
        </Button>
      </div>

      {/* Add Profile Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) {
            addForm.reset()
            addForm.clearErrors()
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          headerDescription="Create a new profile to manage a separate Instagram account."
          headerTitle="Add New Profile"
          headerLeading={
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
              <UserPlus className="text-muted-foreground h-4 w-4" />
            </div>
          }
        >
          <form className="space-y-4" onSubmit={onAddSubmit} noValidate>
            {addForm.formState.errors.root && (
              <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                {addForm.formState.errors.root.message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newUsername">Username</Label>
              <Input
                id="newUsername"
                type="text"
                aria-invalid={!!addForm.formState.errors.username}
                placeholder="your_username"
                {...addForm.register('username', {
                  required: 'Username is required',
                  validate: (v) => v.trim().length > 0 || 'Username is required'
                })}
              />
              {addForm.formState.errors.username && (
                <p className="text-destructive text-sm">
                  {addForm.formState.errors.username.message}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addProfile.isPending}>
                {addProfile.isPending ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open)
          if (!open) {
            passwordForm.reset()
            passwordForm.clearErrors()
            setSuccess(null)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          headerDescription="Enter your new password below."
          headerTitle="Change Password"
          headerLeading={
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
              <Key className="text-muted-foreground h-4 w-4" />
            </div>
          }
        >
          <form className="space-y-4" onSubmit={onPasswordSubmit} noValidate>
            {passwordForm.formState.errors.root && (
              <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                {passwordForm.formState.errors.root.message}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                aria-invalid={!!passwordForm.formState.errors.newPassword}
                placeholder="Enter new password"
                {...passwordForm.register('newPassword', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                placeholder="Confirm new password"
                {...passwordForm.register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) =>
                    v === passwordForm.getValues('newPassword') || 'Passwords do not match'
                })}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Dialog */}
      <Dialog
        open={!!profileToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProfileToDelete(null)
            setDeleteProfileError(null)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          headerTitle="Delete Profile"
          headerDescription={
            <>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{profileToDelete?.username}</span>? This will
              permanently delete all posts associated with this profile.
            </>
          }
        >
          {deleteProfileError && (
            <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              {deleteProfileError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setProfileToDelete(null)}>
              Cancel
            </Button>
            <Button
              disabled={deleteProfile.isPending}
              variant="destructive"
              onClick={handleDeleteProfile}
            >
              {deleteProfile.isPending ? 'Deleting...' : 'Delete Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteAccountDialog}
        onOpenChange={(open) => {
          setShowDeleteAccountDialog(open)
          if (!open) {
            deleteAccountForm.reset()
            deleteAccountForm.clearErrors()
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          headerDescription="This action cannot be undone. This will permanently delete your account, all your profiles, and all posts associated with them."
          headerTitle="Delete Account"
          headerTitleClassName="text-destructive"
          headerLeading={
            <div className="bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-4 w-4" />
            </div>
          }
        >
          <form className="space-y-4" onSubmit={onDeleteAccountSubmit} noValidate>
            {deleteAccountForm.formState.errors.root && (
              <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                {deleteAccountForm.formState.errors.root.message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </Label>
              <Input
                id="deleteConfirmation"
                type="text"
                aria-invalid={!!deleteAccountForm.formState.errors.confirmation}
                placeholder="DELETE"
                {...deleteAccountForm.register('confirmation', {
                  required: 'Please type DELETE to confirm',
                  validate: (v) => v === 'DELETE' || 'Please type DELETE to confirm'
                })}
              />
              {deleteAccountForm.formState.errors.confirmation && (
                <p className="text-destructive text-sm">
                  {deleteAccountForm.formState.errors.confirmation.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteAccountDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={deleteAccount.isPending || deleteConfirmationWatch !== 'DELETE'}
                variant="destructive"
              >
                {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
