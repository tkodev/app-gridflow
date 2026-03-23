'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { useSignInMutation } from '@/queries/auth'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('w-full max-w-sm'),
  header: cva('text-center'),
  title: cva('text-2xl font-bold'),
  subtitle: cva('text-muted-foreground mt-2 text-sm'),
  form: cva('mt-8 space-y-4'),
  errorBanner: cva(
    'border-destructive bg-destructive/10 text-destructive rounded-(--radius) border p-3 text-sm'
  ),
  fieldGroup: cva('space-y-2'),
  fieldError: cva('text-destructive text-sm'),
  submit: cva('w-full'),
  footer: cva('text-muted-foreground mt-6 text-center text-sm'),
  footerLink: cva('text-foreground font-medium underline-offset-4 hover:underline')
}

// 2. types
type LoginFormValues = {
  email: string
  password: string
}

type LoginPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const LoginPage: React.FC<LoginPageProps> = (props) => {
  // a. props
  const { className } = props

  // b. hooks
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

  // c. logic
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

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <div className={styles.header()}>
        <h1 className={styles.title()}>Welcome back</h1>
        <p className={styles.subtitle()}>Sign in to continue planning your grid</p>
      </div>

      <form className={styles.form()} onSubmit={onSubmit} noValidate>
        {errors.root && <div className={styles.errorBanner()}>{errors.root.message}</div>}

        <div className={styles.fieldGroup()}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className={styles.fieldError()}>{errors.email.message}</p>}
        </div>

        <div className={styles.fieldGroup()}>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            placeholder="Your password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className={styles.fieldError()}>{errors.password.message}</p>}
        </div>

        <Button type="submit" className={styles.submit()} disabled={signIn.isPending}>
          {signIn.isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className={styles.footer()}>
        {"Don't have an account? "}
        <Link className={styles.footerLink()} href="/auth/sign-up">
          Sign up
        </Link>
      </p>
    </div>
  )
}

// 4. exports
export default LoginPage
