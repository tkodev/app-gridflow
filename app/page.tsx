import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/atoms/card'
import { Icon } from '@/components/atoms/icon'
import { DemoSection } from '@/components/sections/demo-section'
import { LandingHeader } from '@/components/sections/landing-header'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background min-h-screen'),
  main: cva('px-4 pt-20 pb-16 md:pt-32 md:pb-24'),
  container: cva('mx-auto max-w-6xl'),
  hero: cva('flex flex-col items-center text-center'),
  headline: cva('text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl'),
  headlineMuted: cva('text-muted-foreground'),
  subhead: cva('text-muted-foreground mt-6 max-w-2xl text-lg text-pretty md:text-xl'),
  ctaRow: cva('mt-10 flex flex-col gap-4 sm:flex-row'),
  ctaLg: cva('h-12 px-8 text-base'),
  ctaIcon: cva('ml-2'),
  previewSection: cva('mt-16 md:mt-24'),
  previewFallback: cva(
    'bg-muted/40 mx-auto min-h-112 max-w-md animate-pulse rounded-2xl border md:max-w-lg'
  ),
  featuresSection: cva('bg-muted/30 border-t px-4 py-16 md:py-24'),
  featuresHeading: cva('text-center text-3xl font-bold tracking-tight md:text-4xl'),
  featuresGrid: cva('mt-12 grid grid-cols-12 gap-8'),
  featureCol4a: cva('col-span-12 sm:col-span-6 md:col-span-4'),
  featureCol4b: cva('col-span-12 sm:col-span-6 sm:col-start-4 md:col-span-4 md:col-start-auto'),
  featureCard: cva('items-center text-center'),
  featureIconWrap: cva(
    'bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full'
  ),
  ctaSection: cva('px-4 py-16 md:py-24'),
  ctaInner: cva('mx-auto max-w-2xl text-center'),
  ctaTitle: cva('text-3xl font-bold tracking-tight md:text-4xl'),
  ctaText: cva('text-muted-foreground mt-4 text-lg'),
  ctaPrimary: cva('mt-8'),
  footer: cva('border-t px-4 py-8'),
  footerGrid: cva('mx-auto grid max-w-6xl grid-cols-12 items-center gap-4'),
  footerBrand: cva(
    'col-span-12 flex items-center justify-center gap-2 md:col-span-6 md:justify-start'
  ),
  footerBrandText: cva('font-semibold'),
  footerNote: cva(
    'text-muted-foreground col-span-12 text-center text-sm md:col-span-6 md:text-right'
  )
}

// 2. types
type LandingPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const LandingPage: React.FC<LandingPageProps> = (props) => {
  // a. props
  const { className } = props

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <LandingHeader />

      <main className={styles.main()}>
        <div className={styles.container()}>
          <div className={styles.hero()}>
            <h1 className={styles.headline()}>
              Plan your perfect
              <br />
              <span className={styles.headlineMuted()}>Instagram grid</span>
            </h1>
            <p className={styles.subhead()}>
              Visualize, arrange, and perfect your feed before you post. Drag and drop to see
              exactly how your profile will look.
            </p>
            <div className={styles.ctaRow()}>
              <Button className={styles.ctaLg()} size="lg" asChild>
                <Link href="/auth/sign-up">
                  Get Started Free
                  <Icon name="arrowRight" className={styles.ctaIcon()} size="sm" />
                </Link>
              </Button>
              <Button className={styles.ctaLg()} size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>

          <div className={styles.previewSection()}>
            <React.Suspense fallback={<div className={styles.previewFallback()} aria-hidden />}>
              <DemoSection />
            </React.Suspense>
          </div>
        </div>
      </main>

      <section className={styles.featuresSection()}>
        <div className={styles.container()}>
          <h2 className={styles.featuresHeading()}>Everything you need to plan your feed</h2>
          <div className={styles.featuresGrid()}>
            <div className={styles.featureCol4a()}>
              <Card className={styles.featureCard()}>
                <CardContent className="flex flex-col items-center pt-2 pb-6">
                  <div className={styles.featureIconWrap()}>
                    <Icon name="grid3x3" size="lg" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold">Grid Preview</CardTitle>
                  <CardDescription className="mt-2 text-balance">
                    {
                      "See your posts exactly as they'll appear on your Instagram profile. No more guessing."
                    }
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
            <div className={styles.featureCol4a()}>
              <Card className={styles.featureCard()}>
                <CardContent className="flex flex-col items-center pt-2 pb-6">
                  <div className={styles.featureIconWrap()}>
                    <Icon name="moveVertical" size="lg" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold">Drag & Drop</CardTitle>
                  <CardDescription className="mt-2 text-balance">
                    Easily rearrange posts to find the perfect order. Move things around until it
                    feels right.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
            <div className={styles.featureCol4b()}>
              <Card className={styles.featureCard()}>
                <CardContent className="flex flex-col items-center pt-2 pb-6">
                  <div className={styles.featureIconWrap()}>
                    <Icon name="eye" size="lg" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold">Feed View</CardTitle>
                  <CardDescription className="mt-2 text-balance">
                    Preview individual posts with captions in a scrollable feed format.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection()}>
        <div className={styles.ctaInner()}>
          <h2 className={styles.ctaTitle()}>Ready to perfect your grid?</h2>
          <p className={styles.ctaText()}>
            Join thousands of creators who plan their Instagram content with GridFlow.
          </p>
          <Button className={cn(styles.ctaLg(), styles.ctaPrimary())} size="lg" asChild>
            <Link href="/auth/sign-up">
              Start Planning Free
              <Icon name="arrowRight" className={styles.ctaIcon()} size="sm" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className={styles.footer()}>
        <div className={styles.footerGrid()}>
          <div className={styles.footerBrand()}>
            <Icon name="grid3x3" size="md" />
            <span className={styles.footerBrandText()}>GridFlow</span>
          </div>
          <p className={styles.footerNote()}>Built for creators who care about aesthetics.</p>
        </div>
      </footer>
    </div>
  )
}

// 4. exports
export default LandingPage
