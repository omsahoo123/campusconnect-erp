import { StudentTable } from "@/components/dashboard/students/student-table";
import { studentsData } from "@/lib/data";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">View and manage student profiles.</p>
      </div>
      <StudentTable data={studentsData} />
    </div>
  );
}
