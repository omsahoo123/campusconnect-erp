
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { type Student, studentsData as defaultStudentsData, type Staff, staffData as defaultStaffData } from '@/lib/data';
import { type Hostel, defaultHostels, type Room, defaultMessData } from '@/lib/hostel';
import { type AllStudentFees, defaultStudentFees, type Payment } from '@/lib/finance';
import { type StudentApplication, type TeacherApplication } from '@/lib/applications';
import { type Holiday, holidays as defaultHolidays } from '@/lib/data';
import { type Course, teacherScheduleData as defaultTeacherScheduleData } from '@/lib/data';
import { type Enrollment } from '@/lib/enrollment';
import { type CourseAttendance, type AllAttendanceData } from '@/lib/attendance';
import { type StudentGradesData, studentGradesData as defaultStudentGradesData } from '@/lib/grades';
import { type StudentDeadlines } from '@/lib/deadlines';
import { type ActivityLogItem } from '@/lib/activity';


export interface AppDataContextType {
    // Data
    students: Student[];
    staff: Staff[];
    hostels: Hostel[];
    studentFees: AllStudentFees;
    studentApplications: StudentApplication[];
    teacherApplications: TeacherApplication[];
    holidays: Holiday[];
    courses: Course[];
    enrollments: Enrollment;
    attendance: AllAttendanceData;
    grades: StudentGradesData;
    deadlines: StudentDeadlines;
    activityLog: ActivityLogItem[];

    // Data Setters / Mutators
    setStudents: (students: Student[]) => void;
    addStudent: (student: Student) => void;
    updateStudent: (student: Student) => void;
    deleteStudent: (studentId: string) => void;

    setStaff: (staff: Staff[]) => void;
    addStaff: (staffMember: Staff) => void;
    updateStaff: (staffMember: Staff) => void;
    deleteStaff: (staffId: string) => void;

    setHostels: (hostels: Hostel[]) => void;
    
    setStudentFees: (fees: AllStudentFees) => void;
    addPayment: (studentId: string, payment: Payment) => void;
    
    setStudentApplications: (apps: StudentApplication[]) => void;
    setTeacherApplications: (apps: TeacherApplication[]) => void;
    
    setHolidays: (holidays: Holiday[]) => void;

    setCourses: (courses: Course[]) => void;

    setEnrollments: (enrollments: Enrollment) => void;

    setAttendance: (attendance: AllAttendanceData) => void;

    setGrades: (grades: StudentGradesData) => void;

    setDeadlines: (deadlines: StudentDeadlines) => void;

    logActivity: (item: Omit<ActivityLogItem, 'timestamp'>) => void;

    isLoading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function useAppData() {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
}

const useLocalStorage = <T,>(key: string, defaultValue: T): [T, (value: T) => void] => {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    const setStoredValue = (newValue: T) => {
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(key, JSON.stringify(newValue));
                setValue(newValue);
                 // Dispatch a storage event to sync across tabs
                window.dispatchEvent(new StorageEvent('storage', { key }));
            } catch (error) {
                console.warn(`Error setting localStorage key “${key}”:`, error);
            }
        }
    };
    
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key || e.key === null) { // null key means all storage was cleared
                try {
                    const item = window.localStorage.getItem(key);
                    setValue(item ? JSON.parse(item) : defaultValue);
                } catch (error) {
                    console.warn(`Error reloading localStorage key “${key}”:`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, defaultValue]);


    return [value, setStoredValue];
};


export function AppDataProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    const [students, setStudents] = useLocalStorage<Student[]>('studentsData', defaultStudentsData);
    const [staff, setStaff] = useLocalStorage<Staff[]>('staffData', defaultStaffData);
    const [hostels, setHostels] = useLocalStorage<Hostel[]>('hostelsData', defaultHostels);
    const [studentFees, setStudentFees] = useLocalStorage<AllStudentFees>('studentFees', defaultStudentFees);
    const [studentApplications, setStudentApplications] = useLocalStorage<StudentApplication[]>('studentApplications', []);
    const [teacherApplications, setTeacherApplications] = useLocalStorage<TeacherApplication[]>('teacherApplications', []);
    const [holidays, setHolidays] = useLocalStorage<Holiday[]>('holidays', defaultHolidays);
    const [courses, setCourses] = useLocalStorage<Course[]>('teacherScheduleData', defaultTeacherScheduleData);
    
    const [enrollments, setEnrollments] = useLocalStorage<Enrollment>('courseEnrollments', {});
    const [attendance, setAttendance] = useLocalStorage<AllAttendanceData>('allAttendanceData', {});
    const [grades, setGrades] = useLocalStorage<StudentGradesData>('studentGrades', defaultStudentGradesData);
    const [deadlines, setDeadlines] = useLocalStorage<StudentDeadlines>('studentDeadlines', {});
    const [activityLog, setActivityLog] = useLocalStorage<ActivityLogItem[]>('activityLog', [{ type: 'SYSTEM_START', payload: { name: 'System' }, timestamp: new Date().toISOString() }]);

    // On initial load, ensure all data is present, then set loading to false
    useEffect(() => {
        // This effect just monitors the loading state. The custom hook handles the data loading.
        setIsLoading(false);
    }, []);

    // Derived state and mutators
    const addStudent = (student: Student) => {
        const studentExists = students.some(s => s.id === student.id);
        if (!studentExists) {
            setStudents([...students, student]);
            logActivity({ type: 'NEW_STUDENT', payload: { name: student.name } });
        }
    };
    const updateStudent = (updatedStudent: Student) => {
        setStudents(students.map(s => (s.id === updatedStudent.id ? updatedStudent : s)));
    };
    const deleteStudent = (studentId: string) => {
        setStudents(students.filter(s => s.id !== studentId));
        // Also clean up related data
        const newFees = {...studentFees};
        delete newFees[studentId];
        setStudentFees(newFees);

        const newGrades = {...grades};
        delete newGrades[studentId];
        setGrades(newGrades);

        const newDeadlines = {...deadlines};
        delete newDeadlines[studentId];
        setDeadlines(newDeadlines);

        setHostels(hostels.map(h => ({
            ...h,
            rooms: h.rooms.map(r => ({
                ...r,
                occupants: r.occupants.filter(occId => occId !== studentId)
            }))
        })));
    };
    
    const addStaff = (staffMember: Staff) => {
        const staffExists = staff.some(s => s.id === staffMember.id);
        if (!staffExists) {
            setStaff([...staff, staffMember]);
            logActivity({ type: 'NEW_TEACHER', payload: { name: staffMember.name } });
        }
    };
    const updateStaff = (updatedStaff: Staff) => {
        setStaff(staff.map(s => (s.id === updatedStaff.id ? updatedStaff : s)));
    };
    const deleteStaff = (staffId: string) => {
        setStaff(staff.filter(s => s.id !== staffId));
    };

    const addPayment = (studentId: string, payment: Payment) => {
        const updatedFees = { ...studentFees };
        if(updatedFees[studentId]) {
            updatedFees[studentId].payments.push(payment);
            setStudentFees(updatedFees);
        }
    };

    const logActivity = (item: Omit<ActivityLogItem, 'timestamp'>) => {
        const newLogItem = { ...item, timestamp: new Date().toISOString() };
        setActivityLog([newLogItem, ...activityLog]);
    };
    
    const value: AppDataContextType = {
        students,
        staff,
        hostels,
        studentFees,
        studentApplications,
        teacherApplications,
        holidays,
        courses,
        enrollments,
        attendance,
        grades,
        deadlines,
        activityLog,
        
        setStudents,
        addStudent,
        updateStudent,
        deleteStudent,

        setStaff,
        addStaff,
        updateStaff,
        deleteStaff,

        setHostels,
        setStudentFees,
        addPayment,

        setStudentApplications,
        setTeacherApplications,
        setHolidays,
        setCourses,
        setEnrollments,
        setAttendance,
        setGrades,
        setDeadlines,
        logActivity,

        isLoading
    };

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
}

// You can also create helper types for easier use
export type StudentApplication = {
  id: string;
  name: string;
  grade: string;
  gender: 'male' | 'female' | 'other';
  date: string;
  status: 'Pending';
  email: string;
  phone: string;
}

export type TeacherApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: string;
  coverLetter: string;
  status: 'Pending';
}

export type Course = {
    class: string;
    location: string;
    time: string;
};

export type Enrollment = {
    [courseName: string]: string[]; // student IDs
}

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


export type StudentDeadlines = {
    [studentId: string]: {
        id: string;
        subject: string;
        title: string;
        dueDate: string; // ISO string
        document?: string;
        documentName?: string;
    }[];
};

export type ActivityLogItem = {
    type: 'NEW_STUDENT' | 'NEW_TEACHER' | 'SYSTEM_START';
    payload: {
        name: string;
    };
    timestamp: string;
}

