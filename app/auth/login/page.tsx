'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignInMutation } from '@/queries/auth'

type LoginFormValues = {
  email: string
  password: string
}

const LoginPage = () => {
  const router = useRouter()
  const signIn = useSignInMutation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signIn.mutateAsync({ email: data.email, password: data.password })
      router.push('/profiles')
      router.refresh()
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Sign in failed'
      })
    }
  })

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-2 text-sm">Sign in to continue planning your grid</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        {errors.root && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-(--radius) border p-3 text-sm">
            {errors.root.message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            placeholder="Your password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={signIn.isPending}>
          {signIn.isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {"Don't have an account? "}
        <Link
          className="text-foreground font-medium underline-offset-4 hover:underline"
          href="/auth/sign-up"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
