'use client'

import { useQuery } from '@tanstack/react-query'
import { authKeys } from '@/queries/keys'
import { createClient } from '@/utils/supabase-browser'

function useUserQuery() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()
      if (error) throw error
      return user
    },
    staleTime: 1000 * 60 * 5
  })
}

export { useUserQuery }
