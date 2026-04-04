import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { supabaseStorageBucketAvatars, supabaseStorageBucketPosts } from '@/constants/db'
import { rlsQuery } from '@/databases/client'
import { profiles } from '@/schemas/profiles'
import { createClient } from '@/utils/supabase-server'

async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userProfiles = await rlsQuery(user.id, async (tx) => {
    return await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, user.id))
  })

  for (const profile of userProfiles) {
    const { data: postFiles } = await supabase.storage
      .from(supabaseStorageBucketPosts)
      .list(profile.id)

    if (postFiles && postFiles.length > 0) {
      const postFilePaths = postFiles.map((f) => `${profile.id}/${f.name}`)
      await supabase.storage.from(supabaseStorageBucketPosts).remove(postFilePaths)
    }

    const { data: avatarFiles } = await supabase.storage
      .from(supabaseStorageBucketAvatars)
      .list(profile.id)

    if (avatarFiles && avatarFiles.length > 0) {
      const avatarFilePaths = avatarFiles.map((f) => `${profile.id}/${f.name}`)
      await supabase.storage.from(supabaseStorageBucketAvatars).remove(avatarFilePaths)
    }
  }

  await rlsQuery(user.id, async (tx) => {
    await tx.delete(profiles).where(eq(profiles.userId, user.id))
  })

  const { error: signOutError } = await supabase.auth.signOut()
  if (signOutError) {
    return NextResponse.json({ error: signOutError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

export { DELETE }
