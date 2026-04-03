'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { desc, eq } from 'drizzle-orm'
import type {
  DeleteCollectionMutationInput,
  SaveCollectionMutationInput
} from '@/types/mutations'
import type { Collection, CollectionMedia } from '@/types/collection'
import { collectionKeys } from '@/queries/keys'
import { collectionMedia, collections } from '@/schema/collections'
import { rlsQuery } from '@/utils/database'
import { createClient } from '@/utils/supabase-browser'

function useCollectionsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: collectionKeys.all(profileId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      return await rlsQuery(user.id, async (tx) => {
        const collectionRows = await tx
          .select()
          .from(collections)
          .where(eq(collections.profileId, profileId!))
          .orderBy(desc(collections.createdAt))

        const mediaRows = collectionRows.length > 0
          ? await tx.select().from(collectionMedia)
          : []

        return collectionRows.map((c) => {
          const media = mediaRows
            .filter((m) => m.collectionId === c.id)
            .sort((a, b) => a.position - b.position)
            .map((m) => ({
              id: m.id,
              collection_id: m.collectionId,
              media_url: m.mediaUrl,
              media_type: m.mediaType,
              position: m.position,
              created_at: m.createdAt.toISOString()
            }))

          return {
            id: c.id,
            profile_id: c.profileId,
            name: c.name,
            description: c.description,
            cover_url: c.coverUrl,
            created_at: c.createdAt.toISOString(),
            updated_at: c.updatedAt.toISOString(),
            media
          } as Collection & { media: CollectionMedia[] }
        })
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { isEditing, collection, profileId, name, description } = vars

  if (isEditing && collection) {
    const [updated] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .update(collections)
        .set({
          name,
          description: description || null,
          updatedAt: new Date()
        })
        .where(eq(collections.id, collection.id))
        .returning()
    })
    return toCollection(updated)
  }

  const [inserted] = await rlsQuery(user.id, async (tx) => {
    return await tx
      .insert(collections)
      .values({
        profileId,
        name,
        description: description || null
      })
      .returning()
  })
  return toCollection(inserted)
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  await rlsQuery(user.id, async (tx) => {
    // Delete associated media first
    await tx.delete(collectionMedia).where(eq(collectionMedia.collectionId, vars.collection.id))
    // Then delete the collection
    await tx.delete(collections).where(eq(collections.id, vars.collection.id))
  })
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

function toCollection(row: typeof collections.$inferSelect): Collection {
  return {
    id: row.id,
    profile_id: row.profileId,
    name: row.name,
    description: row.description,
    cover_url: row.coverUrl,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString()
  }
}

export {
  deleteCollectionMutationFn,
  saveCollectionMutationFn,
  useCollectionsQuery,
  useDeleteCollectionMutation,
  useSaveCollectionMutation
}
