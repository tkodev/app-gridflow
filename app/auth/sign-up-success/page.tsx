import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SignUpSuccessPage = () => {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <Mail className="text-primary h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Check your email</h1>
      <p className="text-muted-foreground mt-2">
        We sent you a confirmation link. Click the link in your email to activate your account.
      </p>
      <Button className="mt-8" variant="outline" asChild>
        <Link href="/auth/login">Back to Sign In</Link>
      </Button>
    </div>
  )
}

export default SignUpSuccessPage
