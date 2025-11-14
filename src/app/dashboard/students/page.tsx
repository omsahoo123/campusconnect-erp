
import { StudentTable } from "@/components/dashboard/students/student-table";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">View and manage student profiles.</p>
      </div>
      <StudentTable />
    </div>
  );
}
