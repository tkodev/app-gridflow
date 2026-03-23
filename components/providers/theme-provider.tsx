'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// 1. styles & constants

// 2. types
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

// 3. component
const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  // a. props
  const { children, ...rest } = props

  // b. hooks

  // c. logic

  // d. component
  return <NextThemesProvider {...rest}>{children}</NextThemesProvider>
}

// 4. exports
export { ThemeProvider }
