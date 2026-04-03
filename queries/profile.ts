'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eq, asc } from 'drizzle-orm'
import type { Profile } from '@/types/profile'
import type { UpdateProfileMutationInput } from '@/types/mutations'
import { supabaseStorageBucketAvatars } from '@/constants/db'
import { profileKeys } from '@/queries/keys'
import { profiles } from '@/schema/profiles'
import { rlsQuery } from '@/utils/database'
import { createClient } from '@/utils/supabase-browser'
import { sanitizeUsername } from '@/utils/username'

function useProfilesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.all(userId ?? ''),
    queryFn: async () => {
      const rows = await rlsQuery(userId!, async (tx) => {
        return await tx
          .select()
          .from(profiles)
          .where(eq(profiles.userId, userId!))
          .orderBy(asc(profiles.createdAt))
      })
      return rows.map(toProfile)
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2
  })
}

async function updateProfileMutationFn(vars: UpdateProfileMutationInput): Promise<void> {
  const supabase = createClient()
  let newAvatarUrl: string | null = vars.existingAvatarUrl

  if (vars.newAvatarFile) {
    const fileExt = vars.newAvatarFile.name.split('.').pop()
    const fileName = `${vars.profileId}/avatar-${Date.now()}.${fileExt}`

    if (vars.existingAvatarUrl) {
      const marker = `/${supabaseStorageBucketAvatars}/`
      const oldPath = vars.existingAvatarUrl.split(marker)[1]
      if (oldPath) {
        await supabase.storage.from(supabaseStorageBucketAvatars).remove([oldPath])
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(supabaseStorageBucketAvatars)
      .upload(fileName, vars.newAvatarFile)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(supabaseStorageBucketAvatars)
      .getPublicUrl(fileName)

    newAvatarUrl = urlData.publicUrl
  } else if (vars.removeStoredAvatar && vars.existingAvatarUrl) {
    const marker = `/${supabaseStorageBucketAvatars}/`
    const oldPath = vars.existingAvatarUrl.split(marker)[1]
    if (oldPath) {
      await supabase.storage.from(supabaseStorageBucketAvatars).remove([oldPath])
    }
    newAvatarUrl = null
  }

  // DB update via Drizzle — no RLS needed, the caller is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  await rlsQuery(user.id, async (tx) => {
    await tx
      .update(profiles)
      .set({
        username: sanitizeUsername(vars.username),
        displayName: vars.displayName || null,
        bio: vars.bio || null,
        avatarUrl: newAvatarUrl,
        gridRatio: vars.gridRatio,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, vars.profileId))
  })
}

function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfileMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  })
}

function toProfile(row: typeof profiles.$inferSelect): Profile {
  return {
    id: row.id,
    user_id: row.userId,
    username: row.username,
    display_name: row.displayName,
    bio: row.bio,
    avatar_url: row.avatarUrl,
    grid_ratio: row.gridRatio,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString()
  }
}

export { updateProfileMutationFn, useProfilesQuery, useUpdateProfileMutation }
