'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import type {
  AddProfileMutationInput,
  ChangeEmailMutationInput,
  ChangePasswordMutationInput,
  DeleteProfileMutationInput
} from '@/types/mutations'
import type { Profile } from '@/types/profile'
import { supabaseStorageBucketAvatars, supabaseStorageBucketPosts } from '@/constants/db'
import { profiles } from '@/schema/profiles'
import { rlsQuery } from '@/utils/database'
import { createClient } from '@/utils/supabase-browser'
import { sanitizeUsername } from '@/utils/username'

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

      const [inserted] = await rlsQuery(user.id, async (tx) => {
        return await tx
          .insert(profiles)
          .values({
            userId: user.id,
            username: sanitizeUsername(vars.username)
          })
          .returning()
      })

      return {
        id: inserted.id,
        user_id: inserted.userId,
        username: inserted.username,
        display_name: inserted.displayName,
        bio: inserted.bio,
        avatar_url: inserted.avatarUrl,
        grid_ratio: inserted.gridRatio,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString()
      } as Profile
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

      // Clean up storage
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

      // Delete profile via Drizzle (cascade deletes posts, collections, etc.)
      await rlsQuery(user.id, async (tx) => {
        await tx.delete(profiles).where(eq(profiles.id, profile.id))
      })
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

      // Clean up storage for all profiles
      const userProfiles = await rlsQuery(user.id, async (tx) => {
        return await tx
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.userId, user.id))
      })

      if (userProfiles.length > 0) {
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

      // Delete all profiles (cascade handles posts, collections, etc.)
      await rlsQuery(user.id, async (tx) => {
        await tx.delete(profiles).where(eq(profiles.userId, user.id))
      })

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
