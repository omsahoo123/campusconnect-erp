
import type { UserRole } from "@/hooks/use-current-user";

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

export const studentsData = [
  { id: "STU001", name: "Om Sahoo", gender: "male", email: "osahoo9178@gmail.com", phone: "(123) 456-7890", joinDate: "2023-01-15", status: "Active" as const },
  { id: "STU002", name: "Jane Doe", gender: "female", email: "jane.doe@campus.edu", phone: "(123) 555-0102", joinDate: "2023-02-01", status: "Active" as const },
  { id: "STU003", name: "John Smith", gender: "male", email: "john.smith@campus.edu", phone: "(123) 555-0103", joinDate: "2023-01-20", status: "Active" as const },
  { id: "STU004", name: "Emily White", gender: "female", email: "emily.white@campus.edu", phone: "(123) 555-0104", joinDate: "2023-03-10", status: "Active" as const }
];

export const staffData = [
  { id: "TCH01", name: "Ayushman Patra", department: "Computer Science", email: "osahoo225@gmail.com", status: "Active" as const },
  { id: "TCH02", name: "Emily Vance", department: "Statistics", email: "e.vance@campus.edu", status: "Active" as const }
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
