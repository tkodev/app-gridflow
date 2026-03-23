import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/atoms/card'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { DemoView } from '@/components/sections/demo-view'
import { LandingFooter } from '@/components/sections/landing-footer'
import { LandingHeader } from '@/components/sections/landing-header'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background min-h-screen'),
  main: cva('flex flex-col gap-16 pt-20 pb-16 md:gap-24 md:pt-32 md:pb-24'),
  hero: cva('flex flex-col items-center text-center'),
  headline: cva('text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl'),
  headlineMuted: cva('text-muted-foreground'),
  subhead: cva('text-muted-foreground mt-6 max-w-2xl text-lg text-pretty md:text-xl'),
  ctaRow: cva('mt-10 flex flex-col gap-4 sm:flex-row'),
  ctaLg: cva('h-12 px-8 text-base'),
  ctaIcon: cva('ml-2'),
  featuresSection: cva('bg-muted/30 border-t py-16 md:py-24'),
  featuresHeading: cva('text-center text-3xl font-bold tracking-tight md:text-4xl'),
  featuresGrid: cva('mt-12 grid grid-cols-12 gap-8'),
  featureCol4a: cva('col-span-12 sm:col-span-6 md:col-span-4'),
  featureCol4b: cva('col-span-12 sm:col-span-6 sm:col-start-4 md:col-span-4 md:col-start-auto'),
  featureCard: cva('items-center text-center'),
  featureCardContent: cva('flex flex-col items-center pt-2 pb-6'),
  featureCardTitle: cva('mt-4 text-lg font-semibold'),
  featureCardDescription: cva('mt-2 text-balance'),
  featureIconWrap: cva(
    'bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full'
  ),
  ctaSection: cva('py-16 md:py-24'),
  ctaInner: cva('mx-auto max-w-2xl text-center'),
  ctaTitle: cva('text-3xl font-bold tracking-tight md:text-4xl'),
  ctaText: cva('text-muted-foreground mt-4 text-lg'),
  ctaPrimary: cva('mt-8')
}

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
        <section aria-labelledby="landing-hero-heading">
          <Container>
            <div className={styles.hero()}>
              <h1 id="landing-hero-heading" className={styles.headline()}>
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
          </Container>
        </section>

        <section aria-label="Interactive grid preview">
          <Container>
            <DemoView />
          </Container>
        </section>

        <section className={styles.featuresSection()} aria-labelledby="landing-features-heading">
          <Container>
            <h2 id="landing-features-heading" className={styles.featuresHeading()}>
              Everything you need to plan your feed
            </h2>
            <div className={styles.featuresGrid()}>
              <div className={styles.featureCol4a()}>
                <Card className={styles.featureCard()}>
                  <CardContent className={styles.featureCardContent()}>
                    <div className={styles.featureIconWrap()}>
                      <Icon name="grid3x3" size="lg" />
                    </div>
                    <CardTitle className={styles.featureCardTitle()}>Grid Preview</CardTitle>
                    <CardDescription className={styles.featureCardDescription()}>
                      {
                        "See your posts exactly as they'll appear on your Instagram profile. No more guessing."
                      }
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
              <div className={styles.featureCol4a()}>
                <Card className={styles.featureCard()}>
                  <CardContent className={styles.featureCardContent()}>
                    <div className={styles.featureIconWrap()}>
                      <Icon name="moveVertical" size="lg" />
                    </div>
                    <CardTitle className={styles.featureCardTitle()}>Drag & Drop</CardTitle>
                    <CardDescription className={styles.featureCardDescription()}>
                      Easily rearrange posts to find the perfect order. Move things around until it
                      feels right.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
              <div className={styles.featureCol4b()}>
                <Card className={styles.featureCard()}>
                  <CardContent className={styles.featureCardContent()}>
                    <div className={styles.featureIconWrap()}>
                      <Icon name="eye" size="lg" />
                    </div>
                    <CardTitle className={styles.featureCardTitle()}>Feed View</CardTitle>
                    <CardDescription className={styles.featureCardDescription()}>
                      Preview individual posts with captions in a scrollable feed format.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section className={styles.ctaSection()} aria-labelledby="landing-cta-heading">
          <Container className={styles.ctaInner()}>
            <h2 id="landing-cta-heading" className={styles.ctaTitle()}>
              Ready to perfect your grid?
            </h2>
            <p className={styles.ctaText()}>
              Join thousands of creators who plan their Instagram content with GridFlow.
            </p>
            <Button className={cn(styles.ctaLg(), styles.ctaPrimary())} size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Planning Free
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
