
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { teacherScheduleData as defaultTeacherScheduleData } from "@/lib/data";
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

type Course = {
    class: string;
    location: string;
    time: string;
};

type Enrollment = {
    [courseName: string]: string[]; // student IDs
}

export default function CoursesPage() {
    const { toast } = useToast();
    const [teacherScheduleData, setTeacherScheduleData] = useState<Course[]>(defaultTeacherScheduleData);
    const [enrollments, setEnrollments] = useState<Enrollment>({});
    const [allStudentsData, setAllStudentsData] = useState<Student[]>([]);

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [dialogType, setDialogType] = useState<'edit' | 'students' | null>(null);
    
    const [editedCourse, setEditedCourse] = useState<{name: string, location: string, time: string}>({name: '', location: '', time: ''});
    const [studentToAdd, setStudentToAdd] = useState<string>('');

    const loadData = useCallback(() => {
        try {
            const storedEnrollments = localStorage.getItem('courseEnrollments');
            const storedStudents = localStorage.getItem('studentsData');
            
            const students = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
            setAllStudentsData(students);

            if (storedEnrollments) {
                setEnrollments(JSON.parse(storedEnrollments));
            } else {
                // Initialize with some default enrollments if none exist
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

    const updateEnrollments = (newEnrollments: Enrollment) => {
        setEnrollments(newEnrollments);
        localStorage.setItem('courseEnrollments', JSON.stringify(newEnrollments));
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

        // Update course details
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

        // Update enrollments if class name changed
        if (oldClassName !== newClassName && enrollments[oldClassName]) {
            const newEnrollments = {...enrollments};
            newEnrollments[newClassName] = newEnrollments[oldClassName];
            delete newEnrollments[oldClassName];
            updateEnrollments(newEnrollments);
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
        toast({ title: "Student Removed", description: "The student has been removed from the course." });
    }

    const getStudentName = (studentId: string) => {
        return allStudentsData.find(s => s.id === studentId)?.name || 'Unknown Student';
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
                             <DialogTrigger asChild>
                                <Button variant="ghost" className="m-4 mt-0" onClick={() => handleStudentsClick(course)}>
                                    <Users className="mr-2 h-4 w-4" /> View Students
                                </Button>
                            </DialogTrigger>
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
                     <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Manage Students</DialogTitle>
                            <DialogDescription>
                                Add or remove students from {selectedCourse.class}.
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
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveStudent(studentId)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
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

    