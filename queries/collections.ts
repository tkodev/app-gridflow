'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Collection, CollectionMedia } from '@/types/collection'
import type { DeleteCollectionMutationInput, SaveCollectionMutationInput } from '@/types/mutations'
import { collectionKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'

async function fetchCollections(
  profileId: string
): Promise<(Collection & { media: CollectionMedia[] })[]> {
  const res = await fetch(`/api/collections?profileId=${encodeURIComponent(profileId)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to load collections')
  }
  const data = (await res.json()) as { collections: (Collection & { media: CollectionMedia[] })[] }
  return data.collections
}

function useCollectionsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: collectionKeys.all(profileId ?? ''),
    queryFn: () => fetchCollections(profileId!),
    enabled: Boolean(profileId),
    staleTime: 1000 * 60 * 2
  })
}

async function saveCollectionMutationFn(vars: SaveCollectionMutationInput): Promise<Collection> {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { isEditing, collection, profileId, name, description } = vars

  if (isEditing && collection) {
    const res = await fetch(`/api/collections/${collection.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(typeof err.error === 'string' ? err.error : 'Failed to save collection')
    }
    const data = (await res.json()) as { collection: Collection }
    return data.collection
  }

  const res = await fetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId,
      name,
      description
    })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to create collection')
  }
  const data = (await res.json()) as { collection: Collection }
  return data.collection
}

function useSaveCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveCollectionMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    }
  })
}

async function deleteCollectionMutationFn(vars: DeleteCollectionMutationInput): Promise<void> {
  const res = await fetch(`/api/collections/${vars.collection.id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to delete collection')
  }
}

function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCollectionMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    }
  })
}

export {
  deleteCollectionMutationFn,
  saveCollectionMutationFn,
  useCollectionsQuery,
  useDeleteCollectionMutation,
  useSaveCollectionMutation
}
