
import type { UserRole } from "@/hooks/use-current-user";
import type { Student as StudentType } from "@/components/dashboard/students/student-table";
import type { Staff as StaffType } from "@/components/dashboard/staff/staff-table";

export type Student = StudentType;
export type Staff = StaffType;


export const userProfiles: Record<UserRole, { name: string; email: string; avatar: string }> = {
  admin: {
    name: "Admin User",
    email: "admin@campus.edu",
    avatar: "/avatars/01.png",
  },
  teacher: {
    name: "Ayushman Patra",
    email: "osahoo225@gmail.com",
    avatar: "/avatars/02.png",
  },
  student: {
    name: "Om Sahoo",
    email: "osahoo9178@gmail.com",
    avatar: "/avatars/03.png",
  },
  finance: {
    name: "Carol White",
    email: "finance@campus.edu",
    avatar: "/avatars/04.png",
  },
  hostel: {
    name: "Henry Cavill",
    email: "hostel@campus.edu",
    avatar: "/avatars/05.png",
  }
};

// Default data is now minimal and clean.
export const studentsData: Student[] = [
  { id: "STU001", name: "Om Sahoo", gender: "male", email: "osahoo9178@gmail.com", phone: "(123) 456-7890", joinDate: "2023-01-15", status: "Active" as const },
  { id: "STU002", name: "Pramila", gender: "female", email: "pramila@example.com", phone: "(123) 555-7895", joinDate: "2023-03-28", status: "Active" as const }
];

export const staffData: Staff[] = [
  { id: "TCH01", name: "Ayushman Patra", department: "Computer Science", email: "osahoo225@gmail.com", phone: "(987) 654-3210", status: "Active" as const },
  { id: "TCH02", name: "Emily Vance", department: "Statistics", email: "e.vance@campus.edu", phone: "(987) 654-3211", status: "Active" as const }
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
