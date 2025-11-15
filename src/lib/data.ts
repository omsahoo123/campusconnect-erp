
import type { UserRole } from "@/hooks/use-current-user";

export const userProfiles: Record<UserRole, { name: string; email: string; avatar: string }> = {
  admin: {
    name: "Admin User",
    email: "admin@campus.edu",
    avatar: "/avatars/01.png",
  },
  teacher: {
    name: "Dr. Eleanor Vance",
    email: "e.vance@campus.edu",
    avatar: "/avatars/02.png",
  },
  student: {
    name: "Alex Johnson",
    email: "a.johnson@campus.edu",
    avatar: "/avatars/03.png",
  },
  finance: {
    name: "Carol White",
    email: "finance@campus.edu",
    avatar: "/avatars/04.png",
  },
};

export const studentsData = [
  { id: "STU001", name: "Liam Smith", email: "liam.smith@example.com", phone: "(123) 456-7890", joinDate: "2023-01-15", status: "Active" as const },
  { id: "STU002", name: "Olivia Brown", email: "olivia.brown@example.com", phone: "(123) 456-7890", joinDate: "2023-01-15", status: "Active" as const },
  { id: "STU003", name: "Noah Jones", email: "noah.jones@example.com", phone: "(123) 456-7890", joinDate: "2023-02-01", status: "Inactive" as const },
  { id: "STU004", name: "Emma Garcia", email: "emma.garcia@example.com", phone: "(123) 456-7890", joinDate: "2023-02-01", status: "Active" as const },
  { id: "STU005", name: "Oliver Miller", email: "oliver.miller@example.com", phone: "(123) 456-7890", joinDate: "2023-03-10", status: "Active" as const },
  { id: "STU006", name: "Ava Davis", email: "ava.davis@example.com", phone: "(123) 456-7890", joinDate: "2023-03-10", status: "Suspended" as const },
  { id: "STU007", name: "Elijah Rodriguez", email: "e.rodriguez@example.com", phone: "(123) 456-7890", joinDate: "2023-04-05", status: "Active" as const },
  { id: "STU008", name: "Sophia Wilson", email: "sophia.wilson@example.com", phone: "(123) 456-7890", joinDate: "2023-04-05", status: "Active" as const },
  { id: "STU009", name: "Alex Johnson", email: "a.johnson@campus.edu", phone: "(123) 456-7890", joinDate: "2023-05-20", status: "Active" as const}
];

export const staffData = [
  { id: "TCH01", name: "Dr. Evelyn Reed", department: "Computer Science", email: "e.reed@campus.edu", status: "Active" as const },
  { id: "TCH02", name: "Mr. Benjamin Carter", department: "Mathematics", email: "b.carter@campus.edu", status: "Active" as const },
  { id: "TCH03", name: "Ms. Isabella Chen", department: "Physics", email: "i.chen@campus.edu", status: "On Leave" as const },
  { id: "TCH04", name: "Prof. Samuel Green", department: "History", email: "s.green@campus.edu", status: "Active" as const },
  { id: "TCH05", name: "Dr. Eleanor Vance", department: "Physics", email: "e.vance@campus.edu", status: "Active" as const }
];

export const feeCollectionData = [
  { month: "Jan", collected: 4000, pending: 2400 },
  { month: "Feb", collected: 3000, pending: 1398 },
  { month: "Mar", collected: 5000, pending: 9800 },
  { month: "Apr", collected: 2780, pending: 3908 },
  { month: "May", collected: 1890, pending: 4800 },
  { month: "Jun", collected: 2390, pending: 3800 },
  { month: "Jul", collected: 3490, pending: 4300 },
];

export const studentAttendanceData = [
  { subject: 'Math', total: 20, attended: 18 },
  { subject: 'Physics', total: 20, attended: 19 },
  { subject: 'History', total: 15, attended: 15 },
  { subject: 'English', total: 18, attended: 14 },
  { subject: 'Art', total: 10, attended: 9 },
];

export const teacherScheduleData = [
    { time: '09:00 - 10:30', class: 'Calculus I', location: 'Room 301' },
    { time: '11:00 - 12:30', class: 'Linear Algebra', location: 'Room 302' },
    { time: '14:00 - 15:30', class: 'Advanced Statistics', location: 'Lab 5' },
];

export const holidays = [
    { date: '2024-07-04', name: 'Independence Day' },
    { date: '2024-09-02', name: 'Labor Day' },
];
