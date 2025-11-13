import { AdmissionsForm } from "@/components/dashboard/admissions/admissions-form";

export default function AdmissionsPage() {
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
