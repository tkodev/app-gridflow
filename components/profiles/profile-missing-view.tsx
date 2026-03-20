import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileMissingView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed">
        <UserPlus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">No Profiles Yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first profile to start planning your Instagram grid.
        You can add multiple profiles for different accounts.
      </p>
      <Button asChild className="mt-6">
        <Link href="/settings">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Create Your First Profile
        </Link>
      </Button>
    </div>
  );
}
