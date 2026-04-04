/** Stripe price ID for the Creator Pro monthly subscription. Set via env or hardcode after creating in Stripe dashboard. */
const stripeCreatorProPriceId = process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRO_PRICE_ID ?? ('' as const)

/** Stripe publishable key for client-side usage. */
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ('' as const)

export { stripeCreatorProPriceId, stripePublishableKey }
