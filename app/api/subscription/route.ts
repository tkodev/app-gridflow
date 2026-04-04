import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { rlsQuery } from '@/databases/client'
import { subscriptions } from '@/schemas/subscriptions'
import { createClient } from '@/utils/supabase-server'

function rowToSubscription(row: typeof subscriptions.$inferSelect) {
  return {
    id: row.id,
    user_id: row.userId,
    stripe_subscription_id: row.stripeSubscriptionId,
    stripe_price_id: row.stripePriceId,
    status: row.status,
    current_period_start: row.currentPeriodStart?.toISOString() ?? null,
    current_period_end: row.currentPeriodEnd?.toISOString() ?? null,
    cancel_at_period_end: row.cancelAtPeriodEnd,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString()
  }
}

async function GET() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await rlsQuery(user.id, async (tx) => {
    return await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1)
  })

  if (rows.length === 0) {
    return NextResponse.json({ subscription: null })
  }

  return NextResponse.json({ subscription: rowToSubscription(rows[0]) })
}

export { GET }
