import { StaffTable } from "@/components/dashboard/staff/staff-table";
import { staffData } from "@/lib/data";

export default function StaffPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">View and manage staff profiles.</p>
      </div>
      <StaffTable data={staffData} />
    </div>
  );
}
