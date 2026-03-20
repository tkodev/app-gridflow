'use client'

import { useMutation } from '@tanstack/react-query'
import type {
  DeletePostMutationInput,
  ReorderPostsMutationInput,
  SavePostMutationInput
} from '@/types/mutations'
import type { Post, PostMedia } from '@/types/post'
import {
  SUPABASE_STORAGE_BUCKET_POSTS,
  SUPABASE_STORAGE_CACHE_CONTROL_POSTS,
  SUPABASE_TABLE_POST_MEDIA,
  SUPABASE_TABLE_POSTS
} from '@/constants/supabase'
import { extensionForPostMediaUpload } from '@/utils/post-media'
import { extractPostsBucketObjectPath, removePostFolderObjects } from '@/utils/post-storage'
import { createClient } from '@/utils/supabase-browser'

export async function savePostMutationFn(vars: SavePostMutationInput): Promise<Post> {
  const supabase = createClient()
  const { isEditing, post, profileId, nextPosition, caption, subtitle, status, mediaItems } = vars

  let postId = post?.id
  let postData: Post

  if (isEditing && postId) {
    const { data, error: updateError } = await supabase
      .from(SUPABASE_TABLE_POSTS)
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
      .from(SUPABASE_TABLE_POSTS)
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
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET_POSTS).remove([path])
      }
      await supabase.from(SUPABASE_TABLE_POST_MEDIA).delete().eq('id', media.id)
    }
  }

  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i]

    if (item.isNew && item.file) {
      const ext = extensionForPostMediaUpload(item.file)
      const filePath = `${profileId}/${postId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET_POSTS)
        .upload(filePath, item.file, {
          cacheControl: SUPABASE_STORAGE_CACHE_CONTROL_POSTS,
          upsert: false,
          contentType: item.file.type || undefined
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKET_POSTS)
        .getPublicUrl(filePath)

      const { data: mediaData, error: mediaError } = await supabase
        .from(SUPABASE_TABLE_POST_MEDIA)
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
        .from(SUPABASE_TABLE_POST_MEDIA)
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

export function useSavePostMutation() {
  return useMutation({
    mutationFn: savePostMutationFn
  })
}

export async function deletePostMutationFn(vars: DeletePostMutationInput): Promise<void> {
  const supabase = createClient()
  const { post, profileId } = vars

  const paths = new Set<string>()
  for (const media of post.media) {
    const path = extractPostsBucketObjectPath(media.media_url)
    if (path) paths.add(path)
  }
  if (paths.size > 0) {
    await supabase.storage.from(SUPABASE_STORAGE_BUCKET_POSTS).remove([...paths])
  }

  await removePostFolderObjects(supabase, profileId, post.id)

  const { error } = await supabase.from(SUPABASE_TABLE_POSTS).delete().eq('id', post.id)
  if (error) throw error
}

export function useDeletePostMutation() {
  return useMutation({
    mutationFn: deletePostMutationFn
  })
}

export async function reorderPostsMutationFn(vars: ReorderPostsMutationInput): Promise<void> {
  const supabase = createClient()
  const results = await Promise.all(
    vars.orderedPosts.map((p, index) =>
      supabase.from(SUPABASE_TABLE_POSTS).update({ grid_position: index }).eq('id', p.id)
    )
  )
  const persistError = results.find((r) => r.error)?.error
  if (persistError) throw persistError
}

export function useReorderPostsMutation() {
  return useMutation({
    mutationFn: reorderPostsMutationFn
  })
}
