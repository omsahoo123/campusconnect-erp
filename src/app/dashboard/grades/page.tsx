

"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { studentsData, teacherScheduleData } from "@/lib/data";
import { type StudentGrade, type StudentGradesData, studentGradesData as defaultStudentGradesData } from "@/lib/grades";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const gradeColorMap: { [key: string]: string } = {
    "A+": "bg-green-500",
    "A": "bg-green-500",
    "A-": "bg-green-500",
    "B+": "bg-blue-500",
    "B": "bg-blue-500",
    "B-": "bg-blue-500",
    "C+": "bg-yellow-500",
    "C": "bg-yellow-500",
    "C-": "bg-orange-500",
    "D+": "bg-orange-500",
    "D": "bg-red-500",
    "F": "bg-red-500",
    "N/A": "bg-gray-400",
};

export default function GradesPage() {
  const { role } = useCurrentUser();
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);

  useEffect(() => {
    const loadGrades = () => {
      if (role === 'student') {
        const studentProfile = studentsData.find(s => s.email === 'osahoo9178@gmail.com');
        if (studentProfile) {
          
          let allGrades: StudentGradesData = {};
          const storedGrades = localStorage.getItem('studentGrades');
          if (storedGrades) {
            allGrades = JSON.parse(storedGrades);
          } else {
            localStorage.setItem('studentGrades', JSON.stringify(defaultStudentGradesData));
            allGrades = defaultStudentGradesData;
            window.dispatchEvent(new Event('storage'));
          }
          
          const grades = allGrades[studentProfile.id] || [];

          // Also get attendance
          const storedAttendance = localStorage.getItem('allAttendanceData');
          const allAttendance = storedAttendance ? JSON.parse(storedAttendance) : {};

          const gradesWithAttendance = grades.map(grade => {
            let totalClasses = 0;
            let attendedClasses = 0;
            const courseAttendance = allAttendance[grade.course];
            if (courseAttendance) {
              for (const date in courseAttendance) {
                if (courseAttendance[date].hasOwnProperty(studentProfile.id)) {
                  totalClasses++;
                  if (courseAttendance[date][studentProfile.id]) {
                    attendedClasses++;
                  }
                }
              }
            }
            const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
            return { ...grade, attendance: attendancePercentage };
          });

          setStudentGrades(gradesWithAttendance);
        }
      }
    };
    
    loadGrades();
    window.addEventListener('storage', loadGrades);
    return () => window.removeEventListener('storage', loadGrades);
  }, [role]);

  if (role !== 'student') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground">Grade information is only available for students.</p>
        </div>
      </div>
    );
  }

  const overallGPA = () => {
    const gradePoints: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0,
    };
    const validGrades = studentGrades.filter(g => g.grade !== 'N/A' && gradePoints[g.grade] !== undefined);
    if (validGrades.length === 0) return "N/A";
    const totalPoints = validGrades.reduce((acc, grade) => acc + (gradePoints[grade.grade] || 0), 0);
    return (totalPoints / validGrades.length).toFixed(2);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Grades</h1>
        <p className="text-muted-foreground">Your academic performance for the current semester.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall GPA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{overallGPA()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Breakdown</CardTitle>
          <CardDescription>Your grades and attendance for each course.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentGrades.length > 0 ? (
                studentGrades.map((courseGrade) => (
                  <TableRow key={courseGrade.course}>
                    <TableCell className="font-medium">{courseGrade.course}</TableCell>
                    <TableCell>
                      <Badge className={`${gradeColorMap[courseGrade.grade] || 'bg-gray-400'} text-white`}>
                          {courseGrade.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={courseGrade.attendance} className="w-24 h-2" />
                        <span>{courseGrade.attendance}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No grades available yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    