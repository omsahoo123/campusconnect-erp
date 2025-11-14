
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { teacherScheduleData } from "@/lib/data";
import { useToast } from '@/hooks/use-toast';
import { type Student } from "@/components/dashboard/students/student-table";
import { studentsData as defaultStudentsData } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


interface AttendanceRecord {
    [studentId: string]: boolean;
}

type Enrollment = {
    [courseName: string]: string[]; // student IDs
}

type DailyAttendance = {
    [date: string]: AttendanceRecord; // date is YYYY-MM-DD
}

type CourseAttendance = {
    [courseName: string]: DailyAttendance;
}

export function AttendanceTable() {
    const { toast } = useToast();
    const [selectedCourse, setSelectedCourse] = useState<string>(teacherScheduleData[0].class);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [enrollments, setEnrollments] = useState<Enrollment>({});
    const [allStudentsData, setAllStudentsData] = useState<Student[]>([]);
    const [allAttendanceData, setAllAttendanceData] = useState<CourseAttendance>({});

    const loadData = useCallback(() => {
        try {
            const storedEnrollments = localStorage.getItem('courseEnrollments');
            const storedStudents = localStorage.getItem('studentsData');
            const storedAttendance = localStorage.getItem('allAttendanceData');
            
            const students = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
            setAllStudentsData(students);

            if (storedEnrollments) {
                setEnrollments(JSON.parse(storedEnrollments));
            } else {
                 const initialEnrollments: Enrollment = {};
                teacherScheduleData.forEach((course, courseIndex) => {
                    const studentsPerCourse = Math.floor(students.length / teacherScheduleData.length);
                    const startIndex = courseIndex * studentsPerCourse;
                    const endIndex = startIndex + studentsPerCourse;
                    initialEnrollments[course.class] = students.slice(startIndex, endIndex).map(s => s.id);
                });
                setEnrollments(initialEnrollments);
                localStorage.setItem('courseEnrollments', JSON.stringify(initialEnrollments));
            }

            if (storedAttendance) {
                setAllAttendanceData(JSON.parse(storedAttendance));
            }

        } catch (e) {
            console.error("Failed to load or initialize data", e);
        }
    }, []);
    
    useEffect(() => {
        loadData();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'studentsData' || event.key === 'courseEnrollments' || event.key === 'allAttendanceData') {
                loadData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadData]);


    useEffect(() => {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const courseAttendance = allAttendanceData[selectedCourse];
        if (courseAttendance && courseAttendance[dateString]) {
            setAttendance(courseAttendance[dateString]);
        } else {
            setAttendance({});
        }
    }, [selectedCourse, selectedDate, allAttendanceData]);


    const studentsForCourse = useMemo(() => {
        const studentIds = enrollments[selectedCourse] || [];
        return allStudentsData.filter(student => studentIds.includes(student.id));
    }, [selectedCourse, enrollments, allStudentsData]);

    const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
        setAttendance(prev => ({ ...prev, [studentId]: isPresent }));
    };

    const handleSaveAttendance = () => {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        
        const updatedAttendanceData: CourseAttendance = {
            ...allAttendanceData,
            [selectedCourse]: {
                ...(allAttendanceData[selectedCourse] || {}),
                [dateString]: attendance,
            },
        };
        
        setAllAttendanceData(updatedAttendanceData);
        localStorage.setItem('allAttendanceData', JSON.stringify(updatedAttendanceData));

        toast({
            title: "Attendance Saved",
            description: `Attendance for ${selectedCourse} on ${format(selectedDate, 'PPP')} has been successfully recorded.`
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>Select a course and date to mark attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                    <Select onValueChange={setSelectedCourse} defaultValue={selectedCourse}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                            {teacherScheduleData.map(course => (
                                <SelectItem key={course.class} value={course.class}>
                                    {course.class}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[280px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead className="text-center">Present</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsForCourse.length > 0 ? (
                                studentsForCourse.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={attendance[student.id] || false}
                                                onCheckedChange={(checked) => handleAttendanceChange(student.id, !!checked)}
                                                aria-label={`Mark ${student.name} as present`}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                             ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No students enrolled in this course.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveAttendance} disabled={studentsForCourse.length === 0}>Save Attendance</Button>
                </div>
            </CardContent>
        </Card>
    );
}
