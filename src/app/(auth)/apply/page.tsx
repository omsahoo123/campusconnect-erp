import { JobApplicationForm } from "@/components/auth/job-application-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JobApplicationPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                </Link>
            </Button>
        </div>
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Teacher Job Application</h1>
                <p className="text-muted-foreground">Fill out the form to apply for a teaching position.</p>
            </div>
            <JobApplicationForm />
        </div>
    </div>
  );
}
