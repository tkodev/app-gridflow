'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  AddProfileMutationInput,
  ChangeEmailMutationInput,
  ChangePasswordMutationInput,
  DeleteProfileMutationInput
} from '@/types/mutations'
import type { Profile } from '@/types/profile'
import { supabaseStorageBucketAvatars, supabaseStorageBucketPosts } from '@/constants/db'
import { createClient } from '@/utils/supabase-browser'

function useAddProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
    mutationFn: async (vars: AddProfileMutationInput) => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in')
      }

      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: vars.username })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(typeof err.error === 'string' ? err.error : 'Failed to create profile')
      }

      const data = (await res.json()) as { profile: Profile }
      return data.profile
    }
  })
}

function useDeleteProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
    mutationFn: async (vars: DeleteProfileMutationInput) => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { profile } = vars

      const { data: postFiles } = await supabase.storage
        .from(supabaseStorageBucketPosts)
        .list(profile.id)

      if (postFiles && postFiles.length > 0) {
        const postFilePaths = postFiles.map((f) => `${profile.id}/${f.name}`)
        await supabase.storage.from(supabaseStorageBucketPosts).remove(postFilePaths)
      }

      const { data: avatarFiles } = await supabase.storage
        .from(supabaseStorageBucketAvatars)
        .list(profile.id)

      if (avatarFiles && avatarFiles.length > 0) {
        const avatarFilePaths = avatarFiles.map((f) => `${profile.id}/${f.name}`)
        await supabase.storage.from(supabaseStorageBucketAvatars).remove(avatarFilePaths)
      }

      const res = await fetch(`/api/profiles/${profile.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(typeof err.error === 'string' ? err.error : 'Failed to delete profile')
      }
    }
  })
}

function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (vars: ChangePasswordMutationInput) => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user?.email) {
        throw new Error('Your account does not have an email address for password verification')
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: vars.currentPassword
      })

      if (verifyError) {
        const msg = verifyError.message.toLowerCase()
        if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
          throw new Error('Current password is incorrect')
        }
        throw verifyError
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: vars.newPassword
      })
      if (updateError) throw updateError
    }
  })
}

function useChangeEmailMutation() {
  return useMutation({
    mutationFn: async (vars: ChangeEmailMutationInput) => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user?.email) {
        throw new Error('Your account does not have an email address to update')
      }

      const newEmail = vars.newEmail.trim().toLowerCase()
      if (newEmail === user.email.toLowerCase()) {
        throw new Error('Enter a different email address')
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: vars.currentPassword
      })

      if (verifyError) {
        const msg = verifyError.message.toLowerCase()
        if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
          throw new Error('Current password is incorrect')
        }
        throw verifyError
      }

      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      })
      if (updateError) throw updateError
    }
  })
}

function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(typeof err.error === 'string' ? err.error : 'Failed to delete account')
      }
    }
  })
}

export {
  useAddProfileMutation,
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useDeleteProfileMutation
}
