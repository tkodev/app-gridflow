import type { Metadata, Viewport } from 'next'
import { Geist, Inter } from 'next/font/google'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { cn } from '@/utils/tailwind'
import './globals.css'

// 1. styles & constants
const styles = {
  html: cva('font-sans'),
  body: cva('font-sans')
}

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'GridFlow - Visual Instagram Content Planner',
  description:
    'Plan, preview, and perfect your Instagram feed before you post. Drag and drop to rearrange your grid and see exactly how your profile will look.'
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

// 2. types
type RootLayoutProps = {
  children: React.ReactNode
}

// 3. component
const RootLayout: React.FC<RootLayoutProps> = (props) => {
  // a. props
  const { children } = props

  // d. component
  return (
    <html className={cn(styles.html(), geist.variable)} lang="en" suppressHydrationWarning>
      <body className={cn(styles.body(), inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

// 4. exports
export default RootLayout
