'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DeleteTagSetMutationInput, SaveTagSetMutationInput } from '@/types/mutations'
import type { TagSet } from '@/types/tag-set'
import { tagSetKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'

async function fetchTagSets(profileId: string): Promise<TagSet[]> {
  const res = await fetch(`/api/tag-sets?profileId=${encodeURIComponent(profileId)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to load tag sets')
  }
  const data = (await res.json()) as { tagSets: TagSet[] }
  return data.tagSets
}

function useTagSetsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: tagSetKeys.all(profileId ?? ''),
    queryFn: () => fetchTagSets(profileId!),
    enabled: Boolean(profileId),
    staleTime: 1000 * 60 * 2
  })
}

async function saveTagSetMutationFn(vars: SaveTagSetMutationInput): Promise<TagSet> {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { isEditing, tagSet, profileId, name, tags } = vars

  if (isEditing && tagSet) {
    const res = await fetch(`/api/tag-sets/${tagSet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, tags })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(typeof err.error === 'string' ? err.error : 'Failed to save tag set')
    }
    const data = (await res.json()) as { tagSet: TagSet }
    return data.tagSet
  }

  const res = await fetch('/api/tag-sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, name, tags })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to create tag set')
  }
  const data = (await res.json()) as { tagSet: TagSet }
  return data.tagSet
}

function useSaveTagSetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveTagSetMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagSets'] })
    }
  })
}

async function deleteTagSetMutationFn(vars: DeleteTagSetMutationInput): Promise<void> {
  const res = await fetch(`/api/tag-sets/${vars.tagSet.id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to delete tag set')
  }
}

function useDeleteTagSetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTagSetMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagSets'] })
    }
  })
}

export {
  deleteTagSetMutationFn,
  saveTagSetMutationFn,
  useDeleteTagSetMutation,
  useSaveTagSetMutation,
  useTagSetsQuery
}
