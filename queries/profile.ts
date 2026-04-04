'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UpdateProfileMutationInput } from '@/types/mutations'
import type { Profile } from '@/types/profile'
import { supabaseStorageBucketAvatars } from '@/constants/db'
import { profileKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'

async function fetchProfiles(): Promise<Profile[]> {
  const res = await fetch('/api/profiles')
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to load profiles')
  }
  const data = (await res.json()) as { profiles: Profile[] }
  return data.profiles
}

function useProfilesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.all(userId ?? ''),
    queryFn: fetchProfiles,
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

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const res = await fetch(`/api/profiles/${vars.profileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: vars.username,
      displayName: vars.displayName,
      bio: vars.bio,
      gridRatio: vars.gridRatio,
      avatarUrl: newAvatarUrl
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to update profile')
  }
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
