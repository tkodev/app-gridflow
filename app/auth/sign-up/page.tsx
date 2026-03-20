'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignUpMutation } from '@/queries/auth'

type SignUpFormValues = {
  username: string
  email: string
  password: string
}

const SignUpPage = () => {
  const router = useRouter()
  const signUp = useSignUpMutation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<SignUpFormValues>({
    defaultValues: { username: '', email: '', password: '' }
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp.mutateAsync({
        email: data.email,
        password: data.password,
        username: data.username
      })
      router.push('/profiles')
      router.refresh()
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Sign up failed'
      })
    }
  })

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Start planning your perfect Instagram grid
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        {errors.root && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-(--radius) border p-3 text-sm">
            {errors.root.message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            aria-invalid={!!errors.username}
            autoComplete="username"
            placeholder="your_username"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
        </div>

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
            autoComplete="new-password"
            placeholder="Create a password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          <p className="text-muted-foreground text-xs">Must be at least 6 characters</p>
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={signUp.isPending}>
          {signUp.isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{' '}
        <Link
          className="text-foreground font-medium underline-offset-4 hover:underline"
          href="/auth/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default SignUpPage
