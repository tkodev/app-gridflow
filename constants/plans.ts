/** Subscription plan tier identifiers. */
const planFree = 'free' as const
const planCreatorPro = 'creator_pro' as const

/** Feature limits for the free tier. */
const freeTierMaxProfiles = 1 as const
const freeTierMaxUploadsPerMonth = 30 as const

/** Creator Pro pricing (USD cents). */
const creatorProPriceMonthly = 1200 as const

/** Human-readable plan metadata used across settings and landing pages. */
const plans = [
  {
    id: planFree,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1 Instagram account',
      '30 uploads / month',
      'Advanced visual insights',
      'Basic tag sets'
    ]
  },
  {
    id: planCreatorPro,
    name: 'Creator Pro',
    price: '$12',
    period: 'mo',
    popular: true,
    features: [
      'Unlimited accounts',
      'Unlimited uploads',
      'AI pattern detection',
      'Priority sync',
      'Advanced collections'
    ]
  }
] as const

export {
  creatorProPriceMonthly,
  freeTierMaxProfiles,
  freeTierMaxUploadsPerMonth,
  planCreatorPro,
  planFree,
  plans
}
