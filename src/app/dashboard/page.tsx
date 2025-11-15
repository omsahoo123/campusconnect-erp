'use client';

import { AdminDashboard } from "@/components/dashboard/dashboards/admin-dashboard";
import { FinanceDashboard } from "@/components/dashboard/dashboards/finance-dashboard";
import { HostelDashboard } from "@/components/dashboard/dashboards/hostel-dashboard";
import { StudentDashboard } from "@/components/dashboard/dashboards/student-dashboard";
import { TeacherDashboard } from "@/components/dashboard/dashboards/teacher-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { role, isLoaded } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !role) {
      router.push("/login");
    }
  }, [role, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="h-64 rounded-lg col-span-1 lg:col-span-4" />
            <Skeleton className="h-64 rounded-lg col-span-1 lg:col-span-3" />
        </div>
      </div>
    );
  }

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'finance':
      return <FinanceDashboard />;
    case 'hostel':
      return <HostelDashboard />;
    default:
      return null;
  }
}
