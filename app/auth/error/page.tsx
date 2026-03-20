import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Authentication Error</h1>
      <p className="mt-2 text-muted-foreground">
        Something went wrong during authentication. Please try again.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Button asChild>
          <Link href="/auth/login">Try Again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
