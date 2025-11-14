"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { teacherScheduleData, studentsData } from "@/lib/data";
import { BookOpen, Users } from "lucide-react";

export default function CoursesPage() {

    const courses = teacherScheduleData.map(course => ({
        ...course,
        studentCount: Math.floor(studentsData.length / teacherScheduleData.length) + Math.floor(Math.random() * 5 - 2)
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
                <p className="text-muted-foreground">Here are the courses you are teaching this semester.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">{course.class}</CardTitle>
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <CardDescription>Location: {course.location}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{course.studentCount} students enrolled</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
