'use client'

import { useMutation } from '@tanstack/react-query'
import type {
  AddProfileMutationInput,
  ChangeEmailMutationInput,
  ChangePasswordMutationInput,
  DeleteProfileMutationInput
} from '@/types/mutations'
import type { Profile } from '@/types/profile'
import {
  supabaseStorageBucketAvatars,
  supabaseStorageBucketPosts,
  supabaseTableProfiles
} from '@/constants/db'
import { createClient } from '@/utils/supabase-browser'
import { sanitizeUsername } from '@/utils/username'

function useAddProfileMutation() {
  return useMutation({
    mutationFn: async (vars: AddProfileMutationInput) => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in')
      }

      const { data, error: insertError } = await supabase
        .from(supabaseTableProfiles)
        .insert({
          user_id: user.id,
          username: sanitizeUsername(vars.username)
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          throw new Error('This username is already taken')
        }
        throw insertError
      }

      return data as Profile
    }
  })
}

function useDeleteProfileMutation() {
  return useMutation({
    mutationFn: async (vars: DeleteProfileMutationInput) => {
      const supabase = createClient()
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

      const { error: deleteError } = await supabase
        .from(supabaseTableProfiles)
        .delete()
        .eq('id', profile.id)

      if (deleteError) throw deleteError
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
      const supabase = createClient()

      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not signed in')
      }

      const { data: userProfiles } = await supabase
        .from(supabaseTableProfiles)
        .select('id')
        .eq('user_id', user.id)

      if (userProfiles && userProfiles.length > 0) {
        for (const profile of userProfiles) {
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
        }
      }

      const { error: profilesError } = await supabase
        .from(supabaseTableProfiles)
        .delete()
        .eq('user_id', user.id)

      if (profilesError) throw profilesError

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
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
