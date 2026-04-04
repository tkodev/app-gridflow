'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import type { Subscription } from '@/types/subscription'
import { subscriptionKeys } from '@/queries/keys'

async function fetchSubscription(): Promise<Subscription | null> {
  const res = await fetch('/api/subscription')
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to load subscription')
  }
  const data = (await res.json()) as { subscription: Subscription | null }
  return data.subscription
}

function useSubscriptionQuery(userId: string | undefined) {
  return useQuery({
    queryKey: subscriptionKeys.detail(userId ?? ''),
    queryFn: fetchSubscription,
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
