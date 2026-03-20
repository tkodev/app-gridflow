import Link from "next/link";
import { Grid3X3, MoveVertical, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/landing/header";
import { GridPreview } from "@/components/landing/grid-preview";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <main className="px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Plan your perfect
              <br />
              <span className="text-muted-foreground">Instagram grid</span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              Visualize, arrange, and perfect your feed before you post.
              Drag and drop to see exactly how your profile will look.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
              >
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
      <section className="border-t bg-muted/30 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to plan your feed
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Grid3X3 className="h-6 w-6" />}
              title="Grid Preview"
              description="See your posts exactly as they'll appear on your Instagram profile. No more guessing."
            />
            <FeatureCard
              icon={<MoveVertical className="h-6 w-6" />}
              title="Drag & Drop"
              description="Easily rearrange posts to find the perfect order. Move things around until it feels right."
            />
            <FeatureCard
              icon={<Eye className="h-6 w-6" />}
              title="Feed View"
              description="Preview individual posts with captions in a scrollable feed format."
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
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of creators who plan their Instagram content with GridFlow.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-8 text-base">
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
          <p className="text-sm text-muted-foreground">
            Built for creators who care about aesthetics.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
