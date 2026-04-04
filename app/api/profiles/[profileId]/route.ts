import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { rlsQuery } from '@/databases/client'
import { profiles } from '@/schemas/profiles'
import { profileRowToProfile } from '@/utils/profile-map'
import { createClient } from '@/utils/supabase-server'
import { sanitizeUsername } from '@/utils/username'

async function DELETE(_request: Request, context: { params: Promise<{ profileId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profileId } = await context.params

  try {
    const deleted = await rlsQuery(user.id, async (tx) => {
      const rows = await tx
        .delete(profiles)
        .where(eq(profiles.id, profileId))
        .returning({ id: profiles.id })
      return rows[0]
    })

    if (!deleted) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

type PatchBody = {
  username: string
  displayName: string
  bio: string
  gridRatio: 'square' | 'portrait'
  avatarUrl: string | null
}

async function PATCH(request: Request, context: { params: Promise<{ profileId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { profileId } = await context.params

  if (!body.username?.trim()) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  if (body.gridRatio !== 'square' && body.gridRatio !== 'portrait') {
    return NextResponse.json({ error: 'Invalid grid ratio' }, { status: 400 })
  }

  try {
    const updated = await rlsQuery(user.id, async (tx) => {
      const rows = await tx
        .update(profiles)
        .set({
          username: sanitizeUsername(body.username),
          displayName: body.displayName?.trim() || null,
          bio: body.bio?.trim() || null,
          avatarUrl: body.avatarUrl,
          gridRatio: body.gridRatio,
          updatedAt: new Date()
        })
        .where(eq(profiles.id, profileId))
        .returning()

      return rows[0]
    })

    if (!updated) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile: profileRowToProfile(updated) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { DELETE, PATCH }
