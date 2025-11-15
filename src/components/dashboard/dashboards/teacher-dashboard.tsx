
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Book, Users, BarChart, AlertTriangle } from "lucide-react";
import { teacherScheduleData, userProfiles } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const studentPerformance = [
    { name: "Liam Smith", attendance: 95, grade: "A+" },
    { name: "Olivia Brown", attendance: 88, grade: "A" },
    { name: "Noah Jones", attendance: 74, grade: "C" }, // Low attendance
    { name: "Emma Garcia", attendance: 98, grade: "A+" },
    { name: "Oliver Miller", attendance: 91, grade: "A-" },
    { name: "Ava Davis", attendance: 85, grade: "B" },
    { name: "James Wilson", attendance: 92, grade: "D+" }, // Low grade
    { name: "Isabella Martinez", attendance: 78, grade: "C-" }, // Low attendance and grade
];

const gradeThreshold = 75; // C
const attendanceThreshold = 80;

const gradeValues: {[key: string]: number} = {
    'A+': 98, 'A': 95, 'A-': 92,
    'B+': 88, 'B': 85, 'B-': 82,
    'C+': 78, 'C': 75, 'C-': 72,
    'D+': 68, 'D': 65, 'F': 50,
}


const studentsAtRisk = studentPerformance.filter(student => {
    const gradeValue = gradeValues[student.grade] || 0;
    return student.attendance < attendanceThreshold || gradeValue < gradeThreshold;
});

const getRiskReason = (student: typeof studentPerformance[0]) => {
    const gradeValue = gradeValues[student.grade] || 0;
    const reasons = [];
    if (student.attendance < attendanceThreshold) reasons.push("Low Attendance");
    if (gradeValue < gradeThreshold) reasons.push("Low Grade");
    return reasons.join(' & ');
}

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Welcome, {userProfiles.teacher.name}!</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next class at 09:00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherScheduleData.length}</div>
            <p className="text-xs text-muted-foreground">for this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">across all courses</p>
          </CardContent>
        </Card>
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students at Risk</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">{studentsAtRisk.length}</div>
                <p className="text-xs text-muted-foreground">Low attendance/grades</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Students at Risk</DialogTitle>
              <DialogDescription>
                These students have low attendance or poor grades and may require intervention.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {studentsAtRisk.length > 0 ? (
                studentsAtRisk.map(student => (
                  <div key={student.name} className="flex items-center gap-4">
                     <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                     </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Attendance: <span className={student.attendance < attendanceThreshold ? 'text-destructive' : ''}>{student.attendance}%</span>, 
                        Grade: <span className={(gradeValues[student.grade] || 0) < gradeThreshold ? 'text-destructive' : ''}>{student.grade}</span>
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-500">{getRiskReason(student)}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No students are currently at risk. Great job!</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Your classes for today.</CardDescription>
            </div>
             <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/courses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {teacherScheduleData.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{item.class}</p>
                  <p className="text-sm text-muted-foreground">{item.time} &middot; {item.location}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Calculus I Performance</CardTitle>
            <CardDescription>A quick look at student performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead>Current Grade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {studentPerformance.map((student) => (
                            <TableRow key={student.name} className={(gradeValues[student.grade] || 0) < gradeThreshold || student.attendance < attendanceThreshold ? "bg-amber-50 dark:bg-amber-900/20" : ""}>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.attendance}%</TableCell>
                                <TableCell>
                                    <Badge variant={(gradeValues[student.grade] || 0) < gradeThreshold ? "destructive" : "secondary"}>{student.grade}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
