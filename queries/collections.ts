'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  DeleteCollectionMutationInput,
  SaveCollectionMutationInput
} from '@/types/mutations'
import type { Collection, CollectionMedia } from '@/types/collection'
import { supabaseTableCollectionMedia, supabaseTableCollections } from '@/constants/db'
import { collectionKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'

function useCollectionsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: collectionKeys.all(profileId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(supabaseTableCollections)
        .select(
          `
          *,
          collection_media(*)
        `
        )
        .eq('profile_id', profileId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => {
        const { collection_media, ...rest } = row as typeof row & {
          collection_media?: CollectionMedia[]
        }
        return {
          ...rest,
          media: (collection_media ?? []).sort((a: CollectionMedia, b: CollectionMedia) => a.position - b.position)
        } as Collection & { media: CollectionMedia[] }
      })
    },
    enabled: Boolean(profileId),
    staleTime: 1000 * 60 * 2
  })
}

async function saveCollectionMutationFn(
  vars: SaveCollectionMutationInput
): Promise<Collection> {
  const supabase = createClient()
  const { isEditing, collection, profileId, name, description } = vars

  if (isEditing && collection) {
    const { data, error } = await supabase
      .from(supabaseTableCollections)
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', collection.id)
      .select()
      .single()
    if (error) throw error
    return data as Collection
  }

  const { data, error } = await supabase
    .from(supabaseTableCollections)
    .insert({
      profile_id: profileId,
      name,
      description: description || null
    })
    .select()
    .single()
  if (error) throw error
  return data as Collection
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

async function deleteCollectionMutationFn(
  vars: DeleteCollectionMutationInput
): Promise<void> {
  const supabase = createClient()
  const { collection } = vars

  // Delete associated media from storage if needed
  const { data: mediaItems } = await supabase
    .from(supabaseTableCollectionMedia)
    .select('id')
    .eq('collection_id', collection.id)

  if (mediaItems && mediaItems.length > 0) {
    await supabase
      .from(supabaseTableCollectionMedia)
      .delete()
      .eq('collection_id', collection.id)
  }

  const { error } = await supabase
    .from(supabaseTableCollections)
    .delete()
    .eq('id', collection.id)
  if (error) throw error
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
