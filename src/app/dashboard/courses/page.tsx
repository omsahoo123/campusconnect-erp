

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { teacherScheduleData as defaultTeacherScheduleData, studentsData, staffData } from "@/lib/data";
import { type Student } from "@/components/dashboard/students/student-table";
import { BookOpen, Users, Edit, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { studentsData as defaultStudentsData } from "@/lib/data";
import { studentGradesData as defaultStudentGradesData, type StudentGradesData, type StudentGrade } from "@/lib/grades";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";

type Course = {
    class: string;
    location: string;
    time: string;
};

type Enrollment = {
    [courseName: string]: string[]; // student IDs
}

const StudentCoursesPage = () => {
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [allCourses] = useState<Course[]>(defaultTeacherScheduleData);

    useEffect(() => {
        const studentProfile = studentsData.find(s => s.email === 'student@campus.edu');
        if (studentProfile) {
            const studentId = studentProfile.id;
            const storedEnrollments = localStorage.getItem('courseEnrollments');
            if (storedEnrollments) {
                const enrollments: Enrollment = JSON.parse(storedEnrollments);
                const coursesForStudent = allCourses.filter(course => 
                    enrollments[course.class] && enrollments[course.class].includes(studentId)
                );
                setEnrolledCourses(coursesForStudent);
            }
        }
    }, [allCourses]);

    const getTeacherForCourse = (courseName: string) => {
        if (courseName.includes('Calculus') || courseName.includes('Algebra')) {
            return staffData.find(s => s.name.includes("Carter"))?.name || 'Unknown';
        }
        if (courseName.includes('Statistics')) {
             return staffData.find(s => s.name.includes("Vance"))?.name || 'Unknown';
        }
        return 'N/A';
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
                <p className="text-muted-foreground">Here are the courses you are enrolled in this semester.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">{course.class}</CardTitle>
                            <CardDescription>Taught by {getTeacherForCourse(course.class)}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                             <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                <span>Location: {course.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Time: {course.time}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

const gradeOptions = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "N/A"];

const TeacherCoursesPage = () => {
    const { toast } = useToast();
    const [teacherScheduleData, setTeacherScheduleData] = useState<Course[]>(defaultTeacherScheduleData);
    const [enrollments, setEnrollments] = useState<Enrollment>({});
    const [allStudentsData, setAllStudentsData] = useState<Student[]>([]);
    const [gradesData, setGradesData] = useState<StudentGradesData>({});

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [dialogType, setDialogType] = useState<'edit' | 'students' | null>(null);
    
    const [editedCourse, setEditedCourse] = useState<{name: string, location: string, time: string}>({name: '', location: '', time: ''});
    const [studentToAdd, setStudentToAdd] = useState<string>('');

    const loadData = useCallback(() => {
        try {
            const storedEnrollments = localStorage.getItem('courseEnrollments');
            const storedStudents = localStorage.getItem('studentsData');
            const storedGrades = localStorage.getItem('studentGrades');
            
            const students = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
            setAllStudentsData(students);

            if (storedEnrollments) {
                setEnrollments(JSON.parse(storedEnrollments));
            } else {
                const initialEnrollments: Enrollment = {};
                defaultTeacherScheduleData.forEach((course, courseIndex) => {
                    const studentsPerCourse = Math.floor(students.length / defaultTeacherScheduleData.length);
                    const startIndex = courseIndex * studentsPerCourse;
                    const endIndex = startIndex + studentsPerCourse;
                    initialEnrollments[course.class] = students.slice(startIndex, endIndex).map(s => s.id);
                });
                setEnrollments(initialEnrollments);
                localStorage.setItem('courseEnrollments', JSON.stringify(initialEnrollments));
            }
            
            if (storedGrades) {
                setGradesData(JSON.parse(storedGrades));
            } else {
                setGradesData(defaultStudentGradesData);
                localStorage.setItem('studentGrades', JSON.stringify(defaultStudentGradesData));
            }

        } catch (e) {
            console.error("Failed to load or initialize data", e);
        }
    }, []);
    
    useEffect(() => {
        loadData();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'studentsData' || event.key === 'courseEnrollments' || event.key === 'studentGrades') {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadData]);

    const updateEnrollments = (newEnrollments: Enrollment) => {
        setEnrollments(newEnrollments);
        localStorage.setItem('courseEnrollments', JSON.stringify(newEnrollments));
        window.dispatchEvent(new Event('storage'));
    }
    
    const updateGrades = (newGrades: StudentGradesData) => {
        setGradesData(newGrades);
        localStorage.setItem('studentGrades', JSON.stringify(newGrades));
        window.dispatchEvent(new Event('storage'));
    }

    const handleEditClick = (course: Course) => {
        setSelectedCourse(course);
        setDialogType('edit');
        setEditedCourse({ name: course.class, location: course.location, time: course.time });
    };

    const handleStudentsClick = (course: Course) => {
        setSelectedCourse(course);
        setDialogType('students');
    }

    const handleSave = () => {
        if (!selectedCourse) return;

        const oldClassName = selectedCourse.class;
        const newClassName = editedCourse.name;

        const updatedCourses = teacherScheduleData.map(course => {
            if (course.class === oldClassName) {
                return { 
                    ...course, 
                    class: newClassName, 
                    location: editedCourse.location,
                    time: editedCourse.time,
                };
            }
            return course;
        });
        setTeacherScheduleData(updatedCourses);

        if (oldClassName !== newClassName) {
            if (enrollments[oldClassName]) {
                const newEnrollments = {...enrollments};
                newEnrollments[newClassName] = newEnrollments[oldClassName];
                delete newEnrollments[oldClassName];
                updateEnrollments(newEnrollments);
            }
            const newGrades = {...gradesData};
            Object.keys(newGrades).forEach(studentId => {
                newGrades[studentId] = newGrades[studentId].map(grade => 
                    grade.course === oldClassName ? { ...grade, course: newClassName } : grade
                );
            });
            updateGrades(newGrades);
        }

        toast({
            title: "Course Updated",
            description: `Details for ${editedCourse.name} have been updated.`,
        });
        setDialogType(null);
    };
    
    const handleAddStudent = () => {
        if (!selectedCourse || !studentToAdd) return;
        const courseName = selectedCourse.class;
        
        const currentEnrolled = enrollments[courseName] || [];
        if (currentEnrolled.includes(studentToAdd)) {
            toast({ variant: 'destructive', title: "Already Enrolled", description: "This student is already in the course." });
            return;
        }

        const newEnrollments: Enrollment = {
            ...enrollments,
            [courseName]: [...currentEnrolled, studentToAdd]
        };
        updateEnrollments(newEnrollments);

        // Add a default grade for the new student
        const newGrades: StudentGradesData = {...gradesData};
        if (!newGrades[studentToAdd]) newGrades[studentToAdd] = [];
        const studentHasCourse = newGrades[studentToAdd].some(g => g.course === courseName);
        if(!studentHasCourse) {
            newGrades[studentToAdd].push({ course: courseName, grade: "N/A", attendance: 100 });
            updateGrades(newGrades);
        }

        toast({ title: "Student Added", description: "The student has been enrolled in the course." });
        setStudentToAdd('');
    }

    const handleRemoveStudent = (studentId: string) => {
        if (!selectedCourse) return;
        const courseName = selectedCourse.class;
        
        const newEnrollments: Enrollment = {
            ...enrollments,
            [courseName]: (enrollments[courseName] || []).filter(id => id !== studentId)
        };
        updateEnrollments(newEnrollments);

        // Optional: remove grade entry
        const newGrades = {...gradesData};
        if(newGrades[studentId]) {
            newGrades[studentId] = newGrades[studentId].filter(g => g.course !== courseName);
            updateGrades(newGrades);
        }

        toast({ title: "Student Removed", description: "The student has been removed from the course." });
    }

    const handleGradeChange = (studentId: string, courseName: string, newGrade: string) => {
        const newGrades = {...gradesData};
        if (!newGrades[studentId]) return;

        const gradeIndex = newGrades[studentId].findIndex(g => g.course === courseName);
        if (gradeIndex > -1) {
            newGrades[studentId][gradeIndex].grade = newGrade;
        } else {
             // This case should ideally not happen if student is enrolled
            newGrades[studentId].push({ course: courseName, grade: newGrade, attendance: 100 });
        }
        updateGrades(newGrades);
        toast({ title: "Grade Updated", description: `Grade for student ${studentId} in ${courseName} set to ${newGrade}.`});
    }

    const getStudentName = (studentId: string) => {
        return allStudentsData.find(s => s.id === studentId)?.name || 'Unknown Student';
    }
    
    const getStudentGrade = (studentId: string, courseName: string): string => {
        return gradesData[studentId]?.find(g => g.course === courseName)?.grade || "N/A";
    }

    const availableStudents = useMemo(() => {
        if (!selectedCourse) return [];
        const enrolledIds = enrollments[selectedCourse.class] || [];
        return allStudentsData.filter(s => !enrolledIds.includes(s.id));
    }, [selectedCourse, enrollments, allStudentsData]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
                <p className="text-muted-foreground">Here are the courses you are teaching this semester.</p>
            </div>
            <Dialog onOpenChange={(isOpen) => !isOpen && setDialogType(null)}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teacherScheduleData.map((course, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{course.class}</CardTitle>
                                        <CardDescription>Location: {course.location}</CardDescription>
                                    </div>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(course)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>{(enrollments[course.class] || []).length} students enrolled</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Time: {course.time}</span>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleStudentsClick(course)}>
                                        <Users className="mr-2 h-4 w-4" /> Manage Students
                                    </Button>
                                </DialogTrigger>
                             </CardFooter>
                        </Card>
                    ))}
                </div>
                 {selectedCourse && dialogType === 'edit' && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Course</DialogTitle>
                            <DialogDescription>
                                Make changes to the course details. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={editedCourse.name}
                                    onChange={(e) => setEditedCourse(prev => ({...prev, name: e.target.value}))}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    value={editedCourse.location}
                                    onChange={(e) => setEditedCourse(prev => ({...prev, location: e.target.value}))}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="time" className="text-right">
                                    Time
                                </Label>
                                <Input
                                    id="time"
                                    value={editedCourse.time}
                                    onChange={(e) => setEditedCourse(prev => ({...prev, time: e.target.value}))}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                Cancel
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button onClick={handleSave}>Save changes</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                 )}
                 {selectedCourse && dialogType === 'students' && (
                     <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Manage Students</DialogTitle>
                            <DialogDescription>
                                Add, remove, or grade students for {selectedCourse.class}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Add Student</Label>
                                <div className="flex gap-2">
                                    <Select value={studentToAdd} onValueChange={setStudentToAdd}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a student to add" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableStudents.length > 0 ? (
                                                availableStudents.map(student => (
                                                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                            ))
                                            ) : (
                                                <div className="p-4 text-sm text-muted-foreground">No available students to add.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAddStudent} disabled={!studentToAdd}>
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Add</span>
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Enrolled Students</Label>
                                <ScrollArea className="h-48 rounded-md border">
                                    <div className="p-4">
                                    {(enrollments[selectedCourse.class] || []).length > 0 ? (
                                        (enrollments[selectedCourse.class] || []).map(studentId => (
                                            <div key={studentId} className="flex items-center justify-between py-2">
                                                <span className="text-sm">{getStudentName(studentId)}</span>
                                                <div className="flex items-center gap-2">
                                                     <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="w-20">
                                                                {getStudentGrade(studentId, selectedCourse.class)}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <ScrollArea className="h-[200px]">
                                                                {gradeOptions.map(grade => (
                                                                    <DropdownMenuItem key={grade} onSelect={() => handleGradeChange(studentId, selectedCourse.class, grade)}>
                                                                        {grade}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </ScrollArea>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveStudent(studentId)}>
                                                        <X className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center">No students enrolled yet.</p>
                                    )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Close
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                 )}
            </Dialog>
        </div>
    );
}

export default function CoursesPage() {
    const { role } = useCurrentUser();

    if (role === 'student') {
        return <StudentCoursesPage />;
    }

    if (role === 'teacher') {
        return <TeacherCoursesPage />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
                <p className="text-muted-foreground">Course information is not available for your role.</p>
            </div>
        </div>
    )
}
