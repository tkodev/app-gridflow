'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// 1. types
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

// 2. component
const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  // a. props
  const { children, ...rest } = props

  // d. component
  return <NextThemesProvider {...rest}>{children}</NextThemesProvider>
}

// 3. exports
export type { ThemeProviderProps }
export { ThemeProvider }
