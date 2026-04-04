import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import type { Collection } from '@/types/collection'
import { rlsQuery } from '@/databases/client'
import { collectionMedia, collections } from '@/schemas/collections'
import { createClient } from '@/utils/supabase-server'

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

type PatchBody = {
  name: string
  description: string
}

async function PATCH(request: Request, context: { params: Promise<{ collectionId: string }> }) {
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

  const { collectionId } = await context.params

  try {
    const [updated] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .update(collections)
        .set({
          name: body.name,
          description: body.description || null,
          updatedAt: new Date()
        })
        .where(eq(collections.id, collectionId))
        .returning()
    })

    if (!updated) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json({ collection: toCollection(updated) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

async function DELETE(_request: Request, context: { params: Promise<{ collectionId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { collectionId } = await context.params

  try {
    await rlsQuery(user.id, async (tx) => {
      await tx.delete(collectionMedia).where(eq(collectionMedia.collectionId, collectionId))
      await tx.delete(collections).where(eq(collections.id, collectionId))
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { DELETE, PATCH }
