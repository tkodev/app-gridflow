'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Subscription } from '@/types/subscription'
import { supabaseTableSubscriptions } from '@/constants/db'
import { subscriptionKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'

function useSubscriptionQuery(userId: string | undefined) {
  return useQuery({
    queryKey: subscriptionKeys.detail(userId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(supabaseTableSubscriptions)
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return (data as Subscription) ?? null
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

export {
  createCheckoutMutationFn,
  createPortalMutationFn,
  useCreateCheckoutMutation,
  useCreatePortalMutation,
  useSubscriptionQuery
}
