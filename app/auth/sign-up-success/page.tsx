import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Check your email</h1>
      <p className="mt-2 text-muted-foreground">
        We sent you a confirmation link. Click the link in your email to
        activate your account.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/auth/login">Back to Sign In</Link>
      </Button>
    </div>
  );
}
