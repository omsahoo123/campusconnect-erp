import { AttendanceTable } from "@/components/dashboard/attendance/attendance-table";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground">Mark and manage student attendance.</p>
      </div>
      <AttendanceTable />
    </div>
  );
}
