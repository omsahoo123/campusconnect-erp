"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { teacherScheduleData as defaultTeacherScheduleData, studentsData } from "@/lib/data";
import { BookOpen, Users, Edit, Clock } from "lucide-react";
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

type Course = {
    class: string;
    location: string;
    time: string;
    studentCount: number;
};

export default function CoursesPage() {
    const { toast } = useToast();
    const [teacherScheduleData, setTeacherScheduleData] = useState(() => {
        return defaultTeacherScheduleData.map(course => ({
            ...course,
            studentCount: Math.floor(studentsData.length / defaultTeacherScheduleData.length) + Math.floor(Math.random() * 5 - 2)
        }))
    });
    
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [editedCourse, setEditedCourse] = useState<{name: string, location: string, time: string, studentCount: number}>({name: '', location: '', time: '', studentCount: 0});

    const handleEditClick = (course: Course) => {
        setSelectedCourse(course);
        setEditedCourse({ name: course.class, location: course.location, time: course.time, studentCount: course.studentCount });
    };

    const handleSave = () => {
        if (!selectedCourse) return;

        const updatedCourses = teacherScheduleData.map(course => {
            if (course.class === selectedCourse.class) {
                return { 
                    ...course, 
                    class: editedCourse.name, 
                    location: editedCourse.location,
                    time: editedCourse.time,
                    studentCount: Number(editedCourse.studentCount)
                };
            }
            return course;
        });
        setTeacherScheduleData(updatedCourses);

        toast({
            title: "Course Updated",
            description: `Details for ${editedCourse.name} have been updated.`,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
                <p className="text-muted-foreground">Here are the courses you are teaching this semester.</p>
            </div>
            <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedCourse(null)}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teacherScheduleData.map((course, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">{course.class}</CardTitle>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(course)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                </div>
                                <CardDescription>Location: {course.location}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>{course.studentCount} students enrolled</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-2">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Time: {course.time}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 {selectedCourse && (
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
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="studentCount" className="text-right">
                                    Students
                                </Label>
                                <Input
                                    id="studentCount"
                                    type="number"
                                    value={editedCourse.studentCount}
                                    onChange={(e) => setEditedCourse(prev => ({...prev, studentCount: Number(e.target.value)}))}
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
            </Dialog>
        </div>
    );
}
