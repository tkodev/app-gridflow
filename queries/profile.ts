'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@/types/profile'
import type { UpdateProfileMutationInput } from '@/types/mutations'
import { supabaseStorageBucketAvatars, supabaseTableProfiles } from '@/constants/db'
import { profileKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'
import { sanitizeUsername } from '@/utils/username'

function useProfilesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.all(userId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(supabaseTableProfiles)
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Profile[]
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

  const { error: updateError } = await supabase
    .from(supabaseTableProfiles)
    .update({
      username: sanitizeUsername(vars.username),
      display_name: vars.displayName || null,
      bio: vars.bio || null,
      avatar_url: newAvatarUrl,
      grid_ratio: vars.gridRatio,
      updated_at: new Date().toISOString()
    })
    .eq('id', vars.profileId)

  if (updateError) throw updateError
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

export { updateProfileMutationFn, useProfilesQuery, useUpdateProfileMutation }
