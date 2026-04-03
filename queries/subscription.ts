'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { desc, eq } from 'drizzle-orm'
import type { Subscription } from '@/types/subscription'
import { subscriptionKeys } from '@/queries/keys'
import { subscriptions } from '@/schema/subscriptions'
import { rlsQuery } from '@/utils/database'
import { createClient } from '@/utils/supabase-browser'

function useSubscriptionQuery(userId: string | undefined) {
  return useQuery({
    queryKey: subscriptionKeys.detail(userId ?? ''),
    queryFn: async () => {
      const rows = await rlsQuery(userId!, async (tx) => {
        return await tx
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId!))
          .orderBy(desc(subscriptions.createdAt))
          .limit(1)
      })
      if (rows.length === 0) return null
      return toSubscription(rows[0])
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2
  })
}

async function createCheckoutMutationFn(): Promise<string> {
  const response = await fetch('/api/stripe/checkout', { method: 'POST' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to create checkout session')
  }
  const { url } = (await response.json()) as { url: string }
  return url
}

function useCreateCheckoutMutation() {
  return useMutation({
    mutationFn: createCheckoutMutationFn,
    onSuccess: (url) => {
      window.location.href = url
    }
  })
}

async function createPortalMutationFn(): Promise<string> {
  const response = await fetch('/api/stripe/portal', { method: 'POST' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to create portal session')
  }
  const { url } = (await response.json()) as { url: string }
  return url
}

function useCreatePortalMutation() {
  return useMutation({
    mutationFn: createPortalMutationFn,
    onSuccess: (url) => {
      window.location.href = url
    }
  })
}

function toSubscription(row: typeof subscriptions.$inferSelect): Subscription {
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

export {
  createCheckoutMutationFn,
  createPortalMutationFn,
  useCreateCheckoutMutation,
  useCreatePortalMutation,
  useSubscriptionQuery
}
