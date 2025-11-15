
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarCheck, Clock, CircleDollarSign, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { holidays as defaultHolidays, studentsData } from "@/lib/data";
import { useEffect, useState, useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays, parseISO } from 'date-fns';

type Enrollment = {
    [courseName: string]: string[]; // student IDs
}

interface AttendanceRecord {
    [studentId: string]: boolean;
}

type DailyAttendance = {
    [date: string]: AttendanceRecord; // date is YYYY-MM-DD
}

type CourseAttendance = {
    [courseName: string]: DailyAttendance;
}

type Holiday = {
    date: string;
    name: string;
};

type Deadline = {
    id: string;
    course: string;
    dueDate: string;
}

type StudentDeadlines = {
    [studentId: string]: Deadline[];
}

export function StudentDashboard() {
    const { role } = useCurrentUser();
    const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0);
    const [overallAttendance, setOverallAttendance] = useState(0);
    const [studentAttendance, setStudentAttendance] = useState<{[date: string]: boolean}>({});
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);

    const studentProfile = useMemo(() => studentsData.find(s => s.email === 'student@campus.edu'), []);

    useEffect(() => {
        const storedHolidays = localStorage.getItem('holidays');
        setHolidays(storedHolidays ? JSON.parse(storedHolidays) : defaultHolidays);

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'holidays') {
                setHolidays(JSON.parse(event.newValue || '[]'));
            }
             if (event.key === 'studentDeadlines' && studentProfile) {
                const allDeadlines: StudentDeadlines = JSON.parse(event.newValue || '{}');
                setDeadlines(allDeadlines[studentProfile.id] || []);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [studentProfile]);


    useEffect(() => {
        if (role === 'student' && studentProfile) {
            const studentId = studentProfile.id;
            const storedEnrollments = localStorage.getItem('courseEnrollments');
            const storedAttendance = localStorage.getItem('allAttendanceData');
            const storedDeadlines = localStorage.getItem('studentDeadlines');

            // Calculate enrolled courses
            if (storedEnrollments) {
                const enrollments: Enrollment = JSON.parse(storedEnrollments);
                const count = Object.keys(enrollments).filter(courseName => 
                    enrollments[courseName].includes(studentId)
                ).length;
                setEnrolledCoursesCount(count);
            }

            // Calculate attendance
            if (storedAttendance) {
                const allAttendance: CourseAttendance = JSON.parse(storedAttendance);
                const studentRecords: {[date: string]: boolean} = {};
                let totalClasses = 0;
                let attendedClasses = 0;

                for (const courseName in allAttendance) {
                    const courseAttendance = allAttendance[courseName];
                    for (const date in courseAttendance) {
                        const dailyRecord = courseAttendance[date];
                        if (dailyRecord.hasOwnProperty(studentId)) {
                             // This student was in this class on this day
                            totalClasses++;
                            if (dailyRecord[studentId]) { // if present
                                attendedClasses++;
                            }
                            if (studentRecords[date] === undefined || studentRecords[date] === false) {
                                studentRecords[date] = dailyRecord[studentId];
                            }
                        }
                    }
                }
                
                setStudentAttendance(studentRecords);
                if (totalClasses > 0) {
                    setOverallAttendance(Math.round((attendedClasses / totalClasses) * 100));
                } else {
                    setOverallAttendance(100);
                }
            } else {
                 setOverallAttendance(100);
            }

             // Load deadlines
            if (storedDeadlines) {
                const allDeadlines: StudentDeadlines = JSON.parse(storedDeadlines);
                setDeadlines(allDeadlines[studentId] || []);
            }
        }
    }, [role, studentProfile]);


    const holidayDates = useMemo(() => holidays.map(h => new Date(h.date)), [holidays]);
    
    const upcomingDeadlines = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return deadlines
            .filter(d => {
                const dueDate = parseISO(d.dueDate);
                return dueDate >= today;
            })
            .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
    }, [deadlines]);
    
    const deadlinesInNext7Days = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return upcomingDeadlines.filter(d => {
            const dueDate = parseISO(d.dueDate);
            return dueDate <= nextWeek;
        }).length;
    }, [upcomingDeadlines]);


    const modifiers = {
        present: (date: Date) => studentAttendance[format(date, 'yyyy-MM-dd')] === true,
        absent: (date: Date) => studentAttendance[format(date, 'yyyy-MM-dd')] === false,
        holiday: holidayDates,
    };

    const modifiersStyles = {
        present: { backgroundColor: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' },
        absent: { backgroundColor: 'hsl(var(--destructive) / 0.2)', color: 'hsl(var(--destructive))' },
        holiday: { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' },
    };

    const getRemainingDays = (dueDate: string) => {
        const remaining = differenceInDays(parseISO(dueDate), new Date());
        if (remaining < 0) return 'Overdue';
        if (remaining === 0) return 'Due today';
        return `${remaining} day${remaining > 1 ? 's' : ''} remaining`;
    }


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Welcome, {studentProfile?.name.split(' ')[0]}!</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCoursesCount}</div>
            <p className="text-xs text-muted-foreground">for Spring 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendance}%</div>
            <Progress value={overallAttendance} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
            <p className="text-xs text-muted-foreground">{deadlinesInNext7Days} in the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
                <CheckCircle /> Paid
            </div>
            <p className="text-xs text-muted-foreground">Next due on 1st Aug 2024</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>Your attendance for the current month.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
                mode="single"
                selected={new Date()}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border p-0"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(deadline => (
                    <div key={deadline.id} className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-full mt-1">
                            <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{deadline.course}</p>
                            <p className="text-sm text-muted-foreground">Due: {format(parseISO(deadline.dueDate), 'do MMMM, yyyy')}</p>
                            <p className="text-xs text-amber-600">{getRemainingDays(deadline.dueDate)}</p>
                        </div>
                    </div>
                ))
             ) : (
                <div className="text-center text-muted-foreground py-8">No upcoming deadlines.</div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
