'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { planRoute, signInRoute } from '@/constants/routes'
import { useSignUpMutation } from '@/queries/auth'
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
  passwordHint: cva('text-muted-foreground text-xs'),
  submit: cva('w-full'),
  footer: cva('text-muted-foreground mt-6 text-center text-sm'),
  footerLink: cva('text-foreground font-medium underline-offset-4 hover:underline')
}

// 2. types
type SignUpFormValues = {
  username: string
  email: string
  password: string
}

type SignUpPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const SignUpPage: React.FC<SignUpPageProps> = (props) => {
  // a. props
  const { className } = props

  // b. hooks
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

  // c. logic
  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp.mutateAsync({
        email: data.email,
        password: data.password,
        username: data.username
      })
      router.push(planRoute)
      router.refresh()
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Sign up failed'
      })
    }
  })

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <div className={styles.header()}>
        <h1 className={styles.title()}>Create your account</h1>
        <p className={styles.subtitle()}>Start planning your perfect Instagram grid</p>
      </div>

      <form className={styles.form()} onSubmit={onSubmit} noValidate>
        {errors.root && <div className={styles.errorBanner()}>{errors.root.message}</div>}

        <div className={styles.fieldGroup()}>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            aria-invalid={!!errors.username}
            autoComplete="username"
            placeholder="your_username"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && <p className={styles.fieldError()}>{errors.username.message}</p>}
        </div>

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
          <p className={styles.passwordHint()}>Must be at least 6 characters</p>
          {errors.password && <p className={styles.fieldError()}>{errors.password.message}</p>}
        </div>

        <Button type="submit" className={styles.submit()} disabled={signUp.isPending}>
          {signUp.isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className={styles.footer()}>
        Already have an account?{' '}
        <Link className={styles.footerLink()} href={signInRoute}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

// 4. exports
export default SignUpPage
