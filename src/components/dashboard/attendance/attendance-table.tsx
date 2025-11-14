
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


interface AttendanceRecord {
    [studentId: string]: boolean;
}

type Enrollment = {
    [courseName: string]: string[]; // student IDs
}

export function AttendanceTable() {
    const { toast } = useToast();
    const [selectedCourse, setSelectedCourse] = useState<string>(teacherScheduleData[0].class);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [enrollments, setEnrollments] = useState<Enrollment>({});
    const [allStudentsData, setAllStudentsData] = useState<Student[]>([]);

    const loadData = useCallback(() => {
        try {
            const storedEnrollments = localStorage.getItem('courseEnrollments');
            const storedStudents = localStorage.getItem('studentsData');
            
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
        } catch (e) {
            console.error("Failed to load or initialize data", e);
        }
    }, []);
    
    useEffect(() => {
        loadData();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'studentsData' || event.key === 'courseEnrollments') {
                loadData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadData]);


    const studentsForCourse = useMemo(() => {
        const studentIds = enrollments[selectedCourse] || [];
        return allStudentsData.filter(student => studentIds.includes(student.id));
    }, [selectedCourse, enrollments, allStudentsData]);

    const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
        setAttendance(prev => ({ ...prev, [studentId]: isPresent }));
    };

    const handleSaveAttendance = () => {
        const attendanceData = {
            course: selectedCourse,
            date: new Date().toISOString().split('T')[0],
            records: attendance
        };
        // In a real app, you'd save this to a database. We'll just log it.
        console.log("Saving attendance:", attendanceData);
        toast({
            title: "Attendance Saved",
            description: `Attendance for ${selectedCourse} has been successfully recorded.`
        });
        setAttendance({}); // Reset for next time
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>Select a course and mark attendance for today's class.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Select onValueChange={setSelectedCourse} defaultValue={selectedCourse}>
                        <SelectTrigger className="w-[280px]">
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
                    <p className="text-sm text-muted-foreground">
                        Date: {new Date().toLocaleDateString()}
                    </p>
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
                            {studentsForCourse.map(student => (
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
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveAttendance}>Save Attendance</Button>
                </div>
            </CardContent>
        </Card>
    );
}

    