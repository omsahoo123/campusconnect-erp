
import { HolidayManager } from "@/components/dashboard/holidays/holiday-manager";
import { useCurrentUser } from "@/hooks/use-current-user";
import { redirect } from "next/navigation";


export default function HolidayPage() {
    // This is a server component, but we can't get session here easily.
    // So we'll pass this down and let the client component handle role checks.
    // A better solution would involve middleware or a server-side session provider.
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Holiday Management</h1>
        <p className="text-muted-foreground">Add, view, or remove university holidays.</p>
      </div>
      <HolidayManager />
    </div>
  );
}
