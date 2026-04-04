import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import type { TagSet } from '@/types/tag-set'
import { rlsQuery } from '@/databases/client'
import { tagSets } from '@/schemas/tag-sets'
import { createClient } from '@/utils/supabase-server'

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

type PatchBody = {
  name: string
  tags: string
}

async function PATCH(request: Request, context: { params: Promise<{ tagSetId: string }> }) {
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

  const { tagSetId } = await context.params

  try {
    const [updated] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .update(tagSets)
        .set({ name: body.name, tags: body.tags, updatedAt: new Date() })
        .where(eq(tagSets.id, tagSetId))
        .returning()
    })

    if (!updated) {
      return NextResponse.json({ error: 'Tag set not found' }, { status: 404 })
    }

    return NextResponse.json({ tagSet: toTagSet(updated) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

async function DELETE(_request: Request, context: { params: Promise<{ tagSetId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tagSetId } = await context.params

  try {
    await rlsQuery(user.id, async (tx) => {
      await tx.delete(tagSets).where(eq(tagSets.id, tagSetId))
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { DELETE, PATCH }
