
"use client";

import { AdmissionsForm } from "@/components/dashboard/admissions/admissions-form";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function AdmissionsPage() {
  const { role } = useCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Student Admission</h1>
        <p className="text-muted-foreground">Fill out the form to enroll a new student.</p>
      </div>
      <AdmissionsForm />
    </div>
  );
}
