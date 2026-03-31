'use client'

import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Key,
  Mail,
  Plus,
  Trash2,
  UserCircle,
  UserPlus
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { cva } from 'class-variance-authority'
import type { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'
import { ButtonGroup } from '@/components/atoms/button-group'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import { Icon } from '@/components/atoms/icon'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/atoms/table'
import { rootRoute } from '@/constants/routes'
import {
  useAddProfileMutation,
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useDeleteProfileMutation
} from '@/queries/settings'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('space-y-8 py-6'),
  section: cva('space-y-3'),
  sectionLabel: cva('text-muted-foreground text-xs font-semibold tracking-widest uppercase'),
  card: cva(
    'bg-card space-y-4 rounded-xl p-4 shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)]'
  ),
  cardHeader: cva('flex items-center justify-between'),
  sectionTitle: cva('text-sm font-semibold'),
  emptyState: cva('flex flex-col items-center py-8 text-center'),
  emptyText: cva('text-muted-foreground mt-2 text-sm'),
  list: cva('space-y-2'),
  settingsRow: cva(
    'flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface-container-low'
  ),
  settingsRowText: cva('flex flex-col gap-0.5'),
  settingsRowTitle: cva('text-sm font-medium'),
  settingsRowSubtitle: cva('text-muted-foreground text-xs'),
  profileRow: cva(
    'flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface-container-low'
  ),
  profileRowInner: cva('flex items-center gap-3'),
  profileAvatar: cva('size-10'),
  profileName: cva('font-medium'),
  profileDisplay: cva('text-muted-foreground text-sm'),
  deleteProfileBtn: cva('text-destructive hover:bg-destructive/10 hover:text-destructive'),
  srOnly: cva('sr-only'),
  tableWrap: cva('rounded-md'),
  tableCellRight: cva('text-right'),
  mutedText: cva('text-muted-foreground'),
  accountActions: cva('flex justify-end gap-3'),
  billingPlan: cva('flex items-center gap-2'),
  billingPlanName: cva('text-sm font-medium'),
  billingBadge: cva(
    'rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 uppercase'
  ),
  dangerCard: cva(
    'bg-destructive/5 space-y-3 rounded-xl p-4 shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)]'
  ),
  dangerHeader: cva('flex items-center gap-2'),
  dangerTitle: cva('text-destructive text-sm font-semibold'),
  dangerDescription: cva('text-muted-foreground text-xs'),
  dangerActions: cva('flex justify-end'),
  dialogSm: cva('sm:max-w-md'),
  headerLeading: cva('bg-muted flex size-8 items-center justify-center rounded-full'),
  headerLeadingDanger: cva(
    'bg-destructive/10 flex size-8 items-center justify-center rounded-full'
  ),
  form: cva('space-y-4'),
  errorBanner: cva(
    'border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'
  ),
  successBanner: cva(
    'rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400'
  ),
  fieldGroup: cva('space-y-2'),
  fieldError: cva('text-destructive text-sm'),
  hint: cva('text-muted-foreground text-xs'),
  formActions: cva('flex justify-end gap-2'),
  deleteHighlight: cva('font-semibold'),
  deleteMono: cva('font-mono font-semibold'),
  appearanceRow: cva('flex items-center justify-between'),
  appearanceDescription: cva('text-muted-foreground text-xs'),
  appearanceSkeleton: cva('bg-muted h-4 w-40 animate-pulse rounded-md'),
  buttonIconLeading: cva('mr-1.5'),
  chevron: cva('text-muted-foreground shrink-0')
}

// 2. types
type AddProfileFormValues = {
  username: string
}

type PasswordFormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type EmailFormValues = {
  currentPassword: string
  newEmail: string
  confirmEmail: string
}

type DeleteAccountFormValues = {
  confirmation: string
}

type SettingsViewProps = {
  profiles: Profile[]
  userEmail: string
  className?: string
}

// 3. component
const SettingsView: React.FC<SettingsViewProps> = ({
  profiles: initialProfiles,
  userEmail,
  className
}) => {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = React.useState(false)
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)
  const [deleteProfileError, setDeleteProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)

  const addProfile = useAddProfileMutation()
  const deleteProfile = useDeleteProfileMutation()
  const changePassword = useChangePasswordMutation()
  const changeEmail = useChangeEmailMutation()
  const deleteAccount = useDeleteAccountMutation()

  React.useEffect(() => {
    setThemeMounted(true)
  }, [])

  const addForm = useForm<AddProfileFormValues>({
    defaultValues: { username: '' }
  })

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })

  const emailForm = useForm<EmailFormValues>({
    defaultValues: { currentPassword: '', newEmail: '', confirmEmail: '' }
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
    setPasswordSuccess(null)
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      setPasswordSuccess('Password updated successfully')
      passwordForm.reset()
      setTimeout(() => {
        setShowPasswordDialog(false)
        setPasswordSuccess(null)
      }, 1500)
    } catch (err) {
      passwordForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update password'
      })
    }
  })

  const onEmailSubmit = emailForm.handleSubmit(async (data) => {
    emailForm.clearErrors('root')
    setEmailSuccess(null)
    try {
      const trimmed = data.newEmail.trim().toLowerCase()
      await changeEmail.mutateAsync({
        currentPassword: data.currentPassword,
        newEmail: trimmed
      })
      setEmailSuccess(
        'Email update submitted. Check your inbox to confirm the new address if required.'
      )
      emailForm.reset()
      router.refresh()
      setTimeout(() => {
        setShowEmailDialog(false)
        setEmailSuccess(null)
      }, 2500)
    } catch (err) {
      emailForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update email'
      })
    }
  })

  const onDeleteAccountSubmit = deleteAccountForm.handleSubmit(async () => {
    deleteAccountForm.clearErrors('root')
    try {
      await deleteAccount.mutateAsync()
      router.push(rootRoute)
      router.refresh()
    } catch (err) {
      deleteAccountForm.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to delete account'
      })
    }
  })

  const themeValue = theme ?? 'system'

  return (
    <div className={cn(styles.root({ className }))}>
      {/* ACCOUNT Section */}
      <section className={styles.section()}>
        <p className={styles.sectionLabel()}>Account</p>
        <div className={styles.card()}>
          <div className={styles.cardHeader()}>
            <h2 className={styles.sectionTitle()}>Profiles</h2>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Icon className={styles.buttonIconLeading()} icon={Plus} size="sm" />
              Add Profile
            </Button>
          </div>

          {profiles.length === 0 ? (
            <div className={styles.emptyState()}>
              <Icon icon={UserCircle} size="xl" tone="muted" />
              <p className={styles.emptyText()}>
                No profiles yet. Add your first profile to get started.
              </p>
            </div>
          ) : (
            <div className={styles.list()}>
              {profiles.map((profile) => (
                <div key={profile.id} className={styles.profileRow()}>
                  <div className={styles.profileRowInner()}>
                    <Avatar className={styles.profileAvatar()}>
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {(profile.display_name || profile.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={styles.profileName()}>{profile.username}</p>
                      {profile.display_name && (
                        <p className={styles.profileDisplay()}>{profile.display_name}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    className={styles.deleteProfileBtn()}
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setDeleteProfileError(null)
                      setProfileToDelete(profile)
                    }}
                  >
                    <Icon icon={Trash2} size="sm" />
                    <span className={styles.srOnly()}>Delete profile</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card()}>
          <h2 className={styles.sectionTitle()}>Security</h2>
          <div
            className={styles.settingsRow()}
            role="button"
            tabIndex={0}
            onClick={() => setShowEmailDialog(true)}
          >
            <div className={styles.settingsRowText()}>
              <p className={styles.settingsRowTitle()}>Email Address</p>
              <p className={styles.settingsRowSubtitle()}>
                {userEmail || 'No email on this account'}
              </p>
            </div>
            <Icon icon={ChevronRight} size="sm" className={styles.chevron()} />
          </div>
          <div
            className={styles.settingsRow()}
            role="button"
            tabIndex={0}
            onClick={() => setShowPasswordDialog(true)}
          >
            <div className={styles.settingsRowText()}>
              <p className={styles.settingsRowTitle()}>Password</p>
              <p className={styles.settingsRowSubtitle()}>Change your account password</p>
            </div>
            <Icon icon={ChevronRight} size="sm" className={styles.chevron()} />
          </div>
        </div>
      </section>

      {/* BILLING Section */}
      <section className={styles.section()}>
        <p className={styles.sectionLabel()}>Billing</p>
        <div className={styles.card()}>
          <div className={styles.cardHeader()}>
            <div>
              <p className={styles.settingsRowSubtitle()}>Current Plan</p>
              <div className={styles.billingPlan()}>
                <p className={styles.billingPlanName()}>Free</p>
                <span className={styles.billingBadge()}>Active</span>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Upgrade
            </Button>
          </div>
          <div
            className={styles.settingsRow()}
            role="button"
            tabIndex={0}
          >
            <div className={styles.settingsRowText()}>
              <p className={styles.settingsRowTitle()}>Payment Methods</p>
              <p className={styles.settingsRowSubtitle()}>Manage your payment methods</p>
            </div>
            <Icon icon={ChevronRight} size="sm" className={styles.chevron()} />
          </div>
          <div
            className={styles.settingsRow()}
            role="button"
            tabIndex={0}
          >
            <div className={styles.settingsRowText()}>
              <p className={styles.settingsRowTitle()}>Invoices</p>
              <p className={styles.settingsRowSubtitle()}>View billing history</p>
            </div>
            <Icon icon={ChevronRight} size="sm" className={styles.chevron()} />
          </div>
        </div>
      </section>

      {/* PREFERENCES Section */}
      <section className={styles.section()}>
        <p className={styles.sectionLabel()}>Preferences</p>
        <div className={styles.card()}>
          <div className={styles.appearanceRow()}>
            <div className={styles.settingsRowText()}>
              <p className={styles.settingsRowTitle()} id="appearance-heading">
                Dark Mode
              </p>
              <p className={styles.appearanceDescription()}>Sync with system settings</p>
            </div>
            {!themeMounted ? (
              <div className={styles.appearanceSkeleton()} aria-hidden />
            ) : (
              <ButtonGroup aria-labelledby="appearance-heading" role="radiogroup">
                <Button
                  type="button"
                  aria-checked={themeValue === 'light'}
                  role="radio"
                  size="xs"
                  variant={themeValue === 'light' ? 'secondary' : 'outline'}
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
                <Button
                  type="button"
                  aria-checked={themeValue === 'dark'}
                  role="radio"
                  size="xs"
                  variant={themeValue === 'dark' ? 'secondary' : 'outline'}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
                <Button
                  type="button"
                  aria-checked={themeValue === 'system'}
                  role="radio"
                  size="xs"
                  variant={themeValue === 'system' ? 'secondary' : 'outline'}
                  onClick={() => setTheme('system')}
                >
                  System
                </Button>
              </ButtonGroup>
            )}
          </div>
        </div>
      </section>

      {/* DANGER ZONE Section */}
      <section className={styles.section()}>
        <p className={styles.sectionLabel()}>Danger Zone</p>
        <div className={styles.dangerCard()}>
          <div className={styles.dangerHeader()}>
            <Icon icon={AlertTriangle} size="sm" tone="destructive" />
            <h2 className={styles.dangerTitle()}>Delete Account</h2>
          </div>
          <p className={styles.dangerDescription()}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <div className={styles.dangerActions()}>
            <Button size="sm" variant="destructive" onClick={() => setShowDeleteAccountDialog(true)}>
              Delete Account
            </Button>
          </div>
        </div>
      </section>

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
          className={styles.dialogSm()}
          headerDescription="Create a new profile to manage a separate Instagram account."
          headerTitle="Add New Profile"
          headerLeading={
            <div className={styles.headerLeading()}>
              <Icon icon={UserPlus} size="sm" tone="muted" />
            </div>
          }
        >
          <form className={styles.form()} onSubmit={onAddSubmit} noValidate>
            {addForm.formState.errors.root && (
              <div className={styles.errorBanner()}>{addForm.formState.errors.root.message}</div>
            )}

            <div className={styles.fieldGroup()}>
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
                <p className={styles.fieldError()}>{addForm.formState.errors.username.message}</p>
              )}
              <p className={styles.hint()}>Lowercase letters, numbers, and underscores only</p>
            </div>

            <div className={styles.formActions()}>
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
            setPasswordSuccess(null)
          }
        }}
      >
        <DialogContent
          className={styles.dialogSm()}
          headerDescription="Enter your current password, then choose a new one."
          headerTitle="Change Password"
          headerLeading={
            <div className={styles.headerLeading()}>
              <Icon icon={Key} size="sm" tone="muted" />
            </div>
          }
        >
          <form className={styles.form()} onSubmit={onPasswordSubmit} noValidate>
            {passwordForm.formState.errors.root && (
              <div className={styles.errorBanner()}>
                {passwordForm.formState.errors.root.message}
              </div>
            )}
            {passwordSuccess && <div className={styles.successBanner()}>{passwordSuccess}</div>}

            <div className={styles.fieldGroup()}>
              <Label htmlFor="pwd-currentPassword">Current Password</Label>
              <Input
                id="pwd-currentPassword"
                type="password"
                aria-invalid={!!passwordForm.formState.errors.currentPassword}
                autoComplete="current-password"
                placeholder="Enter your current password"
                {...passwordForm.register('currentPassword', {
                  required: 'Current password is required'
                })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className={styles.fieldError()}>
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup()}>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                aria-invalid={!!passwordForm.formState.errors.newPassword}
                autoComplete="new-password"
                placeholder="Enter new password"
                {...passwordForm.register('newPassword', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  validate: (v) =>
                    v !== passwordForm.getValues('currentPassword') ||
                    'New password must be different from your current password'
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className={styles.fieldError()}>
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup()}>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                autoComplete="new-password"
                placeholder="Confirm new password"
                {...passwordForm.register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) =>
                    v === passwordForm.getValues('newPassword') || 'Passwords do not match'
                })}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className={styles.fieldError()}>
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className={styles.formActions()}>
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

      {/* Change Email Dialog */}
      <Dialog
        open={showEmailDialog}
        onOpenChange={(open) => {
          setShowEmailDialog(open)
          if (!open) {
            emailForm.reset()
            emailForm.clearErrors()
            setEmailSuccess(null)
          }
        }}
      >
        <DialogContent
          className={styles.dialogSm()}
          headerDescription="Enter your password, then the new email address."
          headerTitle="Change email"
          headerLeading={
            <div className={styles.headerLeading()}>
              <Icon icon={Mail} size="sm" tone="muted" />
            </div>
          }
        >
          <form className={styles.form()} onSubmit={onEmailSubmit} noValidate>
            {emailForm.formState.errors.root && (
              <div className={styles.errorBanner()}>{emailForm.formState.errors.root.message}</div>
            )}
            {emailSuccess && <div className={styles.successBanner()}>{emailSuccess}</div>}

            <div className={styles.fieldGroup()}>
              <Label htmlFor="email-currentPassword">Current password</Label>
              <Input
                id="email-currentPassword"
                type="password"
                aria-invalid={!!emailForm.formState.errors.currentPassword}
                autoComplete="current-password"
                placeholder="Enter your current password"
                {...emailForm.register('currentPassword', {
                  required: 'Current password is required'
                })}
              />
              {emailForm.formState.errors.currentPassword && (
                <p className={styles.fieldError()}>
                  {emailForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup()}>
              <Label htmlFor="newEmail">New email</Label>
              <Input
                id="newEmail"
                type="email"
                aria-invalid={!!emailForm.formState.errors.newEmail}
                autoComplete="email"
                placeholder="you@example.com"
                {...emailForm.register('newEmail', {
                  required: 'Email is required',
                  validate: (v) => {
                    const t = v.trim().toLowerCase()
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
                      return 'Enter a valid email address'
                    }
                    if (t === userEmail.toLowerCase()) {
                      return 'Enter a different email address'
                    }
                    return true
                  }
                })}
              />
              {emailForm.formState.errors.newEmail && (
                <p className={styles.fieldError()}>{emailForm.formState.errors.newEmail.message}</p>
              )}
            </div>

            <div className={styles.fieldGroup()}>
              <Label htmlFor="confirmEmail">Confirm new email</Label>
              <Input
                id="confirmEmail"
                type="email"
                aria-invalid={!!emailForm.formState.errors.confirmEmail}
                autoComplete="email"
                placeholder="Confirm new email"
                {...emailForm.register('confirmEmail', {
                  required: 'Please confirm your email',
                  validate: (v) =>
                    v.trim().toLowerCase() ===
                      emailForm.getValues('newEmail').trim().toLowerCase() ||
                    'Email addresses do not match'
                })}
              />
              {emailForm.formState.errors.confirmEmail && (
                <p className={styles.fieldError()}>
                  {emailForm.formState.errors.confirmEmail.message}
                </p>
              )}
            </div>

            <div className={styles.formActions()}>
              <Button type="button" variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={changeEmail.isPending}>
                {changeEmail.isPending ? 'Updating...' : 'Update email'}
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
          className={styles.dialogSm()}
          headerTitle="Delete Profile"
          headerDescription={
            <>
              Are you sure you want to delete{' '}
              <span className={styles.deleteHighlight()}>{profileToDelete?.username}</span>? This
              will permanently delete all posts associated with this profile.
            </>
          }
        >
          {deleteProfileError && <div className={styles.errorBanner()}>{deleteProfileError}</div>}
          <div className={styles.formActions()}>
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
          className={styles.dialogSm()}
          headerDescription="This action cannot be undone. This will permanently delete your account, all your profiles, and all posts associated with them."
          headerTitle="Delete Account"
          headerTitleClassName="text-destructive"
          headerLeading={
            <div className={styles.headerLeadingDanger()}>
              <Icon icon={AlertTriangle} size="sm" tone="destructive" />
            </div>
          }
        >
          <form className={styles.form()} onSubmit={onDeleteAccountSubmit} noValidate>
            {deleteAccountForm.formState.errors.root && (
              <div className={styles.errorBanner()}>
                {deleteAccountForm.formState.errors.root.message}
              </div>
            )}

            <div className={styles.fieldGroup()}>
              <Label htmlFor="deleteConfirmation">
                Type <span className={styles.deleteMono()}>DELETE</span> to confirm
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
                <p className={styles.fieldError()}>
                  {deleteAccountForm.formState.errors.confirmation.message}
                </p>
              )}
            </div>

            <div className={styles.formActions()}>
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

// 4. exports
export type { SettingsViewProps }
export { SettingsView }
