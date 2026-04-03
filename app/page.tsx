import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { PricingCard } from '@/components/molecules/pricing-card'
import { DemoView } from '@/components/sections/demo-view'
import { LandingFooter } from '@/components/sections/landing-footer'
import { LandingHeader } from '@/components/sections/landing-header'
import { plans } from '@/constants/plans'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background min-h-screen'),
  main: cva('flex flex-col gap-20 pt-24 pb-16 md:gap-32 md:pt-32 md:pb-24'),

  // Hero
  hero: cva('flex flex-col items-center text-center'),
  headline: cva('font-serif text-4xl leading-tight font-bold tracking-tight text-balance md:text-6xl lg:text-7xl'),
  headlineItalic: cva('font-serif italic'),
  subhead: cva('text-muted-foreground mt-6 max-w-2xl text-lg text-pretty md:text-xl'),
  ctaRow: cva('mt-10 flex flex-col gap-4 sm:flex-row'),
  ctaLg: cva('h-12 px-8 text-base'),
  ctaIcon: cva('ml-2'),

  // Section shared
  sectionLabel: cva('text-muted-foreground text-xs font-semibold tracking-widest uppercase'),
  sectionTitle: cva('font-serif mt-2 text-3xl font-bold tracking-tight md:text-4xl'),
  sectionDescription: cva('text-muted-foreground mt-4 max-w-xl text-lg'),

  // Features — Visual Planning
  featureSection: cva(''),
  featureGrid: cva('grid grid-cols-12 gap-8 items-center'),
  featureTextCol: cva('col-span-12 md:col-span-5'),
  featurePreviewCol: cva('col-span-12 md:col-span-7'),
  featureLearnMore: cva('text-foreground mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline'),

  // Features — Content Organization
  orgGrid: cva('grid grid-cols-12 gap-8 items-center'),
  orgPreviewCol: cva('col-span-12 md:col-span-6'),
  orgTextCol: cva('col-span-12 md:col-span-6'),
  orgFeatureList: cva('mt-6 flex flex-col gap-3'),
  orgFeatureItem: cva('flex items-start gap-3 text-sm'),
  orgFeatureIconWrap: cva(
    'bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-full'
  ),

  // Features — Embedded Feedback (insight cards)
  insightGrid: cva('mt-8 grid grid-cols-12 gap-4'),
  insightCard: cva(
    'bg-card col-span-12 flex flex-col gap-2 rounded-xl p-4 shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)] sm:col-span-6 lg:col-span-3'
  ),
  insightIconWrap: cva(
    'flex size-10 items-center justify-center rounded-full'
  ),
  insightCardTitle: cva('text-sm font-semibold'),
  insightCardDescription: cva('text-muted-foreground text-xs'),

  // Pricing
  pricingSection: cva(''),
  pricingHeading: cva('text-center'),
  pricingGrid: cva('mx-auto mt-12 grid max-w-2xl grid-cols-12 gap-6'),
  pricingCol: cva('col-span-12 sm:col-span-6'),

  // CTA
  ctaSection: cva('text-center'),
  ctaTitle: cva('font-serif text-3xl font-bold tracking-tight md:text-4xl'),
  ctaItalic: cva('font-serif italic'),
  ctaText: cva('text-muted-foreground mt-4 text-lg'),
  ctaPrimary: cva('mt-8')
}

const insightCards = [
  {
    name: 'palette' as const,
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    title: 'Color Imbalance',
    description: 'Detects monotone streaks or clashing hues across adjacent tiles.'
  },
  {
    name: 'eye' as const,
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    title: 'Pattern Detection',
    description: 'Spots unintentional repetition in your grid layout.'
  },
  {
    name: 'sun' as const,
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    title: 'Luminance Flow',
    description: 'Ensures a natural light-to-dark rhythm row by row.'
  },
  {
    name: 'sparkles' as const,
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    title: 'AI Suggestions',
    description: 'Recommends optimal placement for your next upload.'
  }
]

// 2. types
type LandingPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const LandingPage: React.FC<LandingPageProps> = (props) => {
  const { className } = props

  return (
    <div className={cn(styles.root({ className }))}>
      <LandingHeader />

      <main className={styles.main()}>
        {/* Hero */}
        <section aria-labelledby="landing-hero-heading">
          <Container>
            <div className={styles.hero()}>
              <h1 id="landing-hero-heading" className={styles.headline()}>
                Design your Instagram
                <br />
                like a <span className={styles.headlineItalic()}>system</span>, not a feed.
              </h1>
              <p className={styles.subhead()}>
                Visualize, arrange, and perfect your grid before you post. Drag and drop to see
                exactly how your profile will look.
              </p>
              <div className={styles.ctaRow()}>
                <Button className={styles.ctaLg()} size="lg" asChild>
                  <Link href="/auth/sign-up">
                    Start Planning Your Aesthetic
                    <Icon name="arrowRight" className={styles.ctaIcon()} size="sm" />
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Interactive preview */}
        <section aria-label="Interactive grid preview">
          <Container>
            <DemoView />
          </Container>
        </section>

        {/* Section 01 — Visual Planning */}
        <section id="features" className={styles.featureSection()} aria-labelledby="feat-visual">
          <Container>
            <div className={styles.featureGrid()}>
              <div className={styles.featureTextCol()}>
                <p className={styles.sectionLabel()}>01 — Visual Planning</p>
                <h2 id="feat-visual" className={styles.sectionTitle()}>
                  Grid-First Thinking
                </h2>
                <p className={styles.sectionDescription()}>
                  Drag, drop, and perfect your feed before publishing. See exactly how every post
                  fits your aesthetic — no more guessing.
                </p>
                <Link className={styles.featureLearnMore()} href="/auth/sign-up">
                  Learn More &rarr;
                </Link>
              </div>
              <div className={styles.featurePreviewCol()}>
                <DemoView />
              </div>
            </div>
          </Container>
        </section>

        {/* Section 02 — Content Organization */}
        <section className={styles.featureSection()} aria-labelledby="feat-org">
          <Container>
            <div className={styles.orgGrid()}>
              <div className={styles.orgPreviewCol()}>
                <DemoView />
              </div>
              <div className={styles.orgTextCol()}>
                <p className={styles.sectionLabel()}>02 — Content Organization</p>
                <h2 id="feat-org" className={styles.sectionTitle()}>
                  Content Organization
                </h2>
                <p className={styles.sectionDescription()}>
                  Curate collections, manage hashtag sets, and keep every piece of content organized
                  and ready to publish.
                </p>
                <div className={styles.orgFeatureList()}>
                  <div className={styles.orgFeatureItem()}>
                    <div className={styles.orgFeatureIconWrap()}>
                      <Icon name="layers" size="sm" />
                    </div>
                    <span>Smart Tag Sets — group and reuse hashtags across posts</span>
                  </div>
                  <div className={styles.orgFeatureItem()}>
                    <div className={styles.orgFeatureIconWrap()}>
                      <Icon name="barChart3" size="sm" />
                    </div>
                    <span>Moodboard integration — collect inspiration visually</span>
                  </div>
                  <div className={styles.orgFeatureItem()}>
                    <div className={styles.orgFeatureIconWrap()}>
                      <Icon name="zap" size="sm" />
                    </div>
                    <span>Sync across devices — your grid, everywhere</span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Section 03 — Embedded Feedback */}
        <section className={styles.featureSection()} aria-labelledby="feat-feedback">
          <Container>
            <div className={styles.pricingHeading()}>
              <p className={styles.sectionLabel()}>03 — Embedded Feedback</p>
              <h2 id="feat-feedback" className={styles.sectionTitle()}>
                Embedded Feedback
              </h2>
            </div>
            <div className={styles.insightGrid()}>
              {insightCards.map((card) => (
                <div key={card.title} className={styles.insightCard()}>
                  <div className={cn(styles.insightIconWrap(), card.bg)}>
                    <Icon name={card.name} size="sm" />
                  </div>
                  <p className={styles.insightCardTitle()}>{card.title}</p>
                  <p className={styles.insightCardDescription()}>{card.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Pricing */}
        <section id="pricing" className={styles.pricingSection()} aria-labelledby="pricing-heading">
          <Container>
            <div className={styles.pricingHeading()}>
              <h2 id="pricing-heading" className={styles.sectionTitle()}>
                Simple, transparent pricing.
              </h2>
            </div>
            <div className={styles.pricingGrid()}>
              {plans.map((plan) => (
                <div key={plan.id} className={styles.pricingCol()}>
                  <PricingCard
                    planName={plan.name}
                    price={plan.price}
                    period={plan.period}
                    features={plan.features}
                    ctaLabel={plan.id === 'creator_pro' ? 'Get Creator Pro' : 'Get Started Free'}
                    ctaHref="/auth/sign-up"
                    highlighted={'popular' in plan && plan.popular === true}
                    popular={'popular' in plan && plan.popular === true}
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Footer */}
        <section className={styles.ctaSection()} aria-labelledby="landing-cta-heading">
          <Container>
            <h2 id="landing-cta-heading" className={styles.ctaTitle()}>
              Elevate your digital presence <span className={styles.ctaItalic()}>today</span>.
            </h2>
            <p className={styles.ctaText()}>
              Join creators who plan their Instagram content with intention.
            </p>
            <Button className={cn(styles.ctaLg(), styles.ctaPrimary())} size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Planning Your Aesthetic
                <Icon name="arrowRight" className={styles.ctaIcon()} size="sm" />
              </Link>
            </Button>
          </Container>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}

// 4. exports
export default LandingPage
