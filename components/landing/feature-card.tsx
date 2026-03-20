import type { ReactNode } from 'react'

type FeatureCardProps = {
  icon: ReactNode
  title: string
  description: string
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-card flex flex-col items-center rounded-lg border p-6 text-center">
      <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  )
}
