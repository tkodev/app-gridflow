'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  DeletePostMutationInput,
  ReorderPostsMutationInput,
  SavePostMutationInput
} from '@/types/mutations'
import type { Post, PostMedia } from '@/types/post'
import {
  supabaseStorageBucketPosts,
  supabaseStorageCacheControlPosts,
  supabaseTablePostMedia,
  supabaseTablePosts
} from '@/constants/db'
import { postKeys } from '@/queries/keys'
import { extensionForPostMediaUpload, sortPostMediaByPosition } from '@/utils/post-media'
import { extractPostsBucketObjectPath, removePostFolderObjects } from '@/utils/post-storage'
import { createClient } from '@/utils/supabase-browser'

function usePostsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: postKeys.all(profileId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(supabaseTablePosts)
        .select(
          `
          id,
          profile_id,
          caption,
          subtitle,
          grid_position,
          status,
          scheduled_at,
          published_at,
          created_at,
          updated_at,
          post_media(*)
        `
        )
        .eq('profile_id', profileId!)
        .order('grid_position', { ascending: true })
      if (error) throw error
      return (data ?? []).map((row) => {
        const { post_media, ...rest } = row as typeof row & { post_media?: Post['media'] }
        return {
          ...rest,
          media: sortPostMediaByPosition(post_media ?? [])
        } as Post
      })
    },
    enabled: Boolean(profileId),
    staleTime: 1000 * 60 * 2
  })
}

async function savePostMutationFn(vars: SavePostMutationInput): Promise<Post> {
  const supabase = createClient()
  const { isEditing, post, profileId, nextPosition, caption, subtitle, status, mediaItems } = vars

  let postId = post?.id
  let postData: Post

  if (isEditing && postId) {
    const { data, error: updateError } = await supabase
      .from(supabaseTablePosts)
      .update({
        caption: caption || null,
        subtitle: subtitle || null,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (updateError) throw updateError
    postData = data as unknown as Post
  } else {
    const { data, error: insertError } = await supabase
      .from(supabaseTablePosts)
      .insert({
        profile_id: profileId,
        caption: caption || null,
        subtitle: subtitle || null,
        grid_position: nextPosition,
        status: 'draft'
      })
      .select()
      .single()

    if (insertError) throw insertError
    postId = data.id
    postData = data as unknown as Post
  }

  if (!postId) {
    throw new Error('Missing post id')
  }

  const uploadedMedia: PostMedia[] = []

  if (isEditing && post) {
    const currentIds = new Set(mediaItems.filter((m) => !m.isNew).map((m) => m.id))
    const toDelete = post.media.filter((m) => !currentIds.has(m.id))

    for (const media of toDelete) {
      const path = extractPostsBucketObjectPath(media.media_url)
      if (path) {
        await supabase.storage.from(supabaseStorageBucketPosts).remove([path])
      }
      await supabase.from(supabaseTablePostMedia).delete().eq('id', media.id)
    }
  }

  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i]

    if (item.isNew && item.file) {
      const ext = extensionForPostMediaUpload(item.file)
      const filePath = `${profileId}/${postId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(supabaseStorageBucketPosts)
        .upload(filePath, item.file, {
          cacheControl: supabaseStorageCacheControlPosts,
          upsert: false,
          contentType: item.file.type || undefined
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(supabaseStorageBucketPosts)
        .getPublicUrl(filePath)

      const { data: mediaData, error: mediaError } = await supabase
        .from(supabaseTablePostMedia)
        .insert({
          post_id: postId,
          media_url: urlData.publicUrl,
          media_type: item.type,
          position: i
        })
        .select()
        .single()

      if (mediaError) throw mediaError
      uploadedMedia.push(mediaData as PostMedia)
    } else {
      const { data: mediaData, error: updateError } = await supabase
        .from(supabaseTablePostMedia)
        .update({ position: i })
        .eq('id', item.id)
        .select()
        .single()

      if (updateError) throw updateError
      uploadedMedia.push(mediaData as PostMedia)
    }
  }

  postData.media = uploadedMedia
  return postData
}

function useSavePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: savePostMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

async function deletePostMutationFn(vars: DeletePostMutationInput): Promise<void> {
  const supabase = createClient()
  const { post, profileId } = vars

  const paths = new Set<string>()
  for (const media of post.media) {
    const path = extractPostsBucketObjectPath(media.media_url)
    if (path) paths.add(path)
  }
  if (paths.size > 0) {
    await supabase.storage.from(supabaseStorageBucketPosts).remove([...paths])
  }

  await removePostFolderObjects(supabase, profileId, post.id)

  const { error } = await supabase.from(supabaseTablePosts).delete().eq('id', post.id)
  if (error) throw error
}

function useDeletePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePostMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

async function reorderPostsMutationFn(vars: ReorderPostsMutationInput): Promise<void> {
  const supabase = createClient()
  const results = await Promise.all(
    vars.orderedPosts.map((p, index) =>
      supabase.from(supabaseTablePosts).update({ grid_position: index }).eq('id', p.id)
    )
  )
  const persistError = results.find((r) => r.error)?.error
  if (persistError) throw persistError
}

function useReorderPostsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderPostsMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

export {
  deletePostMutationFn,
  reorderPostsMutationFn,
  savePostMutationFn,
  useDeletePostMutation,
  usePostsQuery,
  useReorderPostsMutation,
  useSavePostMutation
}
