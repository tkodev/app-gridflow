import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { rlsQuery } from '@/databases/client'
import { posts } from '@/schemas/posts'
import { createClient } from '@/utils/supabase-server'

type ReorderBody = {
  orderedPosts: { id: string }[]
}

async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ReorderBody
  try {
    body = (await request.json()) as ReorderBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(body.orderedPosts)) {
    return NextResponse.json({ error: 'orderedPosts is required' }, { status: 400 })
  }

  try {
    await rlsQuery(user.id, async (tx) => {
      for (let i = 0; i < body.orderedPosts.length; i++) {
        await tx.update(posts).set({ gridPosition: i }).where(eq(posts.id, body.orderedPosts[i].id))
      }
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Reorder failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { POST }
