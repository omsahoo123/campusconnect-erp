
export interface AttendanceRecord {
    [studentId: string]: boolean;
}

export type DailyAttendance = {
    [date: string]: AttendanceRecord; // date is YYYY-MM-DD
}

export type CourseAttendance = {
    [courseName: string]: DailyAttendance;
}

export type AllAttendanceData = CourseAttendance;
