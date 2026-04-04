'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { desc, eq } from 'drizzle-orm'
import type { DeleteTagSetMutationInput, SaveTagSetMutationInput } from '@/types/mutations'
import type { TagSet } from '@/types/tag-set'
import { tagSetKeys } from '@/queries/keys'
import { tagSets } from '@/schema/tag-sets'
import { rlsQuery } from '@/utils/database'
import { createClient } from '@/utils/supabase-browser'

function useTagSetsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: tagSetKeys.all(profileId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const rows = await rlsQuery(user.id, async (tx) => {
        return await tx
          .select()
          .from(tagSets)
          .where(eq(tagSets.profileId, profileId!))
          .orderBy(desc(tagSets.createdAt))
      })
      return rows.map(toTagSet)
    },
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
    const [updated] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .update(tagSets)
        .set({ name, tags, updatedAt: new Date() })
        .where(eq(tagSets.id, tagSet.id))
        .returning()
    })
    return toTagSet(updated)
  }

  const [inserted] = await rlsQuery(user.id, async (tx) => {
    return await tx.insert(tagSets).values({ profileId, name, tags }).returning()
  })
  return toTagSet(inserted)
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
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  await rlsQuery(user.id, async (tx) => {
    await tx.delete(tagSets).where(eq(tagSets.id, vars.tagSet.id))
  })
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

function toTagSet(row: typeof tagSets.$inferSelect): TagSet {
  return {
    id: row.id,
    profile_id: row.profileId,
    name: row.name,
    tags: row.tags,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString()
  }
}

export {
  deleteTagSetMutationFn,
  saveTagSetMutationFn,
  useDeleteTagSetMutation,
  useSaveTagSetMutation,
  useTagSetsQuery
}
