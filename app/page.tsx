import Link from 'next/link'
import { ArrowRight, Eye, Grid3X3, MoveVertical } from 'lucide-react'
import { FeatureCard } from '@/components/landing/feature-card'
import { GridPreview } from '@/components/landing/grid-preview'
import { LandingHeader } from '@/components/landing/header'
import { Button } from '@/components/ui/button'

const LandingPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <LandingHeader />

      {/* Hero Section */}
      <main className="px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
              Plan your perfect
              <br />
              <span className="text-muted-foreground">Instagram grid</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg text-pretty md:text-xl">
              Visualize, arrange, and perfect your feed before you post. Drag and drop to see
              exactly how your profile will look.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button className="h-12 px-8 text-base" size="lg" asChild>
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button className="h-12 px-8 text-base" size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Grid Preview */}
          <div className="mt-16 md:mt-24">
            <GridPreview />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-muted/30 border-t px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to plan your feed
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              description="See your posts exactly as they'll appear on your Instagram profile. No more guessing."
              icon={<Grid3X3 className="h-6 w-6" />}
              title="Grid Preview"
            />
            <FeatureCard
              description="Easily rearrange posts to find the perfect order. Move things around until it feels right."
              icon={<MoveVertical className="h-6 w-6" />}
              title="Drag & Drop"
            />
            <FeatureCard
              description="Preview individual posts with captions in a scrollable feed format."
              icon={<Eye className="h-6 w-6" />}
              title="Feed View"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to perfect your grid?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Join thousands of creators who plan their Instagram content with GridFlow.
          </p>
          <Button className="mt-8 h-12 px-8 text-base" size="lg" asChild>
            <Link href="/auth/sign-up">
              Start Planning Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            <span className="font-semibold">GridFlow</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Built for creators who care about aesthetics.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
