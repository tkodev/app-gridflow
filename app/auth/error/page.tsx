import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AuthErrorPage = () => {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <AlertCircle className="text-destructive h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Authentication Error</h1>
      <p className="text-muted-foreground mt-2">
        Something went wrong during authentication. Please try again.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Button asChild>
          <Link href="/auth/login">Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}

export default AuthErrorPage
