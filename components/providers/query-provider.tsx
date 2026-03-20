'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { QUERY_STALE_TIME_MS } from '@/constants/query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS
      },
      mutations: {
        retry: false
      }
    }
  })
}

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(makeQueryClient)
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
