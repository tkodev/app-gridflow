import type { Metadata, Viewport } from 'next'
import { Noto_Sans } from 'next/font/google'
import localFont from 'next/font/local'
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

const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' })

const liberationSerif = localFont({
  src: [
    { path: '../public/fonts/LiberationSerif-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/LiberationSerif-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/LiberationSerif-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../public/fonts/LiberationSerif-BoldItalic.woff2', weight: '700', style: 'italic' }
  ],
  variable: '--font-serif'
})

const metadata: Metadata = {
  title: 'Gridflow - Design your Instagram like a system',
  description:
    'The premium workspace for visual architects. Curate, organize, and preview your aesthetic with the precision of a gallery curator.'
}

const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f9f9' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' }
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
    <html
      className={cn(styles.html(), notoSans.variable, liberationSerif.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <body className={cn(styles.body())}>
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
export { metadata, viewport }
