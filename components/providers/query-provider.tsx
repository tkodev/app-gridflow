'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('')
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0
      },
      mutations: {
        retry: false
      }
    }
  })
}

// 2. types
type QueryProviderProps = {
  children: React.ReactNode
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const QueryProvider: React.FC<QueryProviderProps> = (props) => {
  // a. props
  const { children, className } = props

  // b. hooks
  const [client] = React.useState(makeQueryClient)

  // c. logic

  // d. component
  return (
    <QueryClientProvider client={client}>
      {className != null && className !== '' ? (
        <div className={cn(styles.root({ className }))}>{children}</div>
      ) : (
        children
      )}
    </QueryClientProvider>
  )
}

// 4. exports
export { QueryProvider }
