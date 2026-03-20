'use client'

import { useMutation } from '@tanstack/react-query'
import type {
  AddProfileMutationInput,
  ChangePasswordMutationInput,
  DeleteProfileMutationInput
} from '@/types/mutations'
import type { Profile } from '@/types/profile'
import {
  SUPABASE_STORAGE_BUCKET_AVATARS,
  SUPABASE_STORAGE_BUCKET_POSTS,
  SUPABASE_TABLE_PROFILES
} from '@/constants/supabase'
import { createClient } from '@/utils/supabase-browser'
import { sanitizeUsername } from '@/utils/username'

export function useAddProfileMutation() {
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
        .from(SUPABASE_TABLE_PROFILES)
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

export function useDeleteProfileMutation() {
  return useMutation({
    mutationFn: async (vars: DeleteProfileMutationInput) => {
      const supabase = createClient()
      const { profile } = vars

      const { data: postFiles } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET_POSTS)
        .list(profile.id)

      if (postFiles && postFiles.length > 0) {
        const postFilePaths = postFiles.map((f) => `${profile.id}/${f.name}`)
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET_POSTS).remove(postFilePaths)
      }

      const { data: avatarFiles } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET_AVATARS)
        .list(profile.id)

      if (avatarFiles && avatarFiles.length > 0) {
        const avatarFilePaths = avatarFiles.map((f) => `${profile.id}/${f.name}`)
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET_AVATARS).remove(avatarFilePaths)
      }

      const { error: deleteError } = await supabase
        .from(SUPABASE_TABLE_PROFILES)
        .delete()
        .eq('id', profile.id)

      if (deleteError) throw deleteError
    }
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (vars: ChangePasswordMutationInput) => {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: vars.newPassword
      })
      if (updateError) throw updateError
    }
  })
}

export function useDeleteAccountMutation() {
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
        .from(SUPABASE_TABLE_PROFILES)
        .select('id')
        .eq('user_id', user.id)

      if (userProfiles && userProfiles.length > 0) {
        for (const profile of userProfiles) {
          const { data: postFiles } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET_POSTS)
            .list(profile.id)

          if (postFiles && postFiles.length > 0) {
            const postFilePaths = postFiles.map((f) => `${profile.id}/${f.name}`)
            await supabase.storage.from(SUPABASE_STORAGE_BUCKET_POSTS).remove(postFilePaths)
          }

          const { data: avatarFiles } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET_AVATARS)
            .list(profile.id)

          if (avatarFiles && avatarFiles.length > 0) {
            const avatarFilePaths = avatarFiles.map((f) => `${profile.id}/${f.name}`)
            await supabase.storage.from(SUPABASE_STORAGE_BUCKET_AVATARS).remove(avatarFilePaths)
          }
        }
      }

      const { error: profilesError } = await supabase
        .from(SUPABASE_TABLE_PROFILES)
        .delete()
        .eq('user_id', user.id)

      if (profilesError) throw profilesError

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
    }
  })
}
