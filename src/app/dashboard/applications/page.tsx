import { ApplicationsDashboard } from "@/components/dashboard/applications/applications-dashboard";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">Review and manage student and teacher applications.</p>
      </div>
      <ApplicationsDashboard />
    </div>
  );
}
