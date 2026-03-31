import type { Subscription } from '@/types/subscription'

/** Whether the user has an active paid subscription. */
function isSubscriptionActive(subscription: Subscription | null | undefined): boolean {
  return subscription?.status === 'active'
}

/** Whether the subscription is in a grace period (canceled but still active until period end). */
function isSubscriptionCanceling(subscription: Subscription | null | undefined): boolean {
  return subscription?.status === 'active' && subscription.cancel_at_period_end === true
}

/** Human-readable plan name based on subscription status. */
function planDisplayName(subscription: Subscription | null | undefined): string {
  if (!subscription || subscription.status === 'inactive') return 'Free'
  if (subscription.status === 'active') return 'Creator Pro'
  if (subscription.status === 'canceled') return 'Free'
  if (subscription.status === 'past_due') return 'Creator Pro (Past Due)'
  return 'Free'
}

export { isSubscriptionActive, isSubscriptionCanceling, planDisplayName }
