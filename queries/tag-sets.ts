'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DeleteTagSetMutationInput, SaveTagSetMutationInput } from '@/types/mutations'
import type { TagSet } from '@/types/tag-set'
import { supabaseTableTagSets } from '@/constants/db'
import { tagSetKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'

function useTagSetsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: tagSetKeys.all(profileId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(supabaseTableTagSets)
        .select('*')
        .eq('profile_id', profileId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as TagSet[]
    },
    enabled: Boolean(profileId),
    staleTime: 1000 * 60 * 2
  })
}

async function saveTagSetMutationFn(vars: SaveTagSetMutationInput): Promise<TagSet> {
  const supabase = createClient()
  const { isEditing, tagSet, profileId, name, tags } = vars

  if (isEditing && tagSet) {
    const { data, error } = await supabase
      .from(supabaseTableTagSets)
      .update({
        name,
        tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', tagSet.id)
      .select()
      .single()
    if (error) throw error
    return data as TagSet
  }

  const { data, error } = await supabase
    .from(supabaseTableTagSets)
    .insert({
      profile_id: profileId,
      name,
      tags
    })
    .select()
    .single()
  if (error) throw error
  return data as TagSet
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
  const { tagSet } = vars
  const { error } = await supabase
    .from(supabaseTableTagSets)
    .delete()
    .eq('id', tagSet.id)
  if (error) throw error
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
