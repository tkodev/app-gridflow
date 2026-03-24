'use client'

import { useMutation } from '@tanstack/react-query'
import type { SignInMutationInput, SignUpMutationInput } from '@/types/mutations'
import { profileRoute } from '@/constants/routes'
import { createClient } from '@/utils/supabase-browser'
import { sanitizeUsername } from '@/utils/username'

export function useSignInMutation() {
  return useMutation({
    mutationFn: async (vars: SignInMutationInput) => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: vars.email,
        password: vars.password
      })
      if (error) throw error
    }
  })
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (vars: SignUpMutationInput) => {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: vars.email,
        password: vars.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}${profileRoute}`,
          data: {
            username: sanitizeUsername(vars.username),
            display_name: vars.username
          }
        }
      })
      if (error) throw error
    }
  })
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  })
}
