import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarCheck, Clock, CircleDollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { studentAttendanceData } from "@/lib/data";

export function StudentDashboard() {
    const overallAttendance = studentAttendanceData.reduce((acc, curr) => acc + curr.attended, 0) / studentAttendanceData.reduce((acc, curr) => acc + curr.total, 0) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Welcome, Alex!</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">for Spring 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendance.toFixed(1)}%</div>
            <Progress value={overallAttendance} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">in the next 7 days</p>
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
            <CardTitle>Attendance Details</CardTitle>
            <CardDescription>Your attendance for each subject.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentAttendanceData.map(subject => {
                const percentage = (subject.attended / subject.total) * 100;
                return (
                    <div key={subject.subject}>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium">{subject.subject}</p>
                            <p className={`text-sm font-medium ${percentage < 75 ? 'text-destructive' : 'text-foreground'}`}>{percentage.toFixed(0)}%</p>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Attended {subject.attended} of {subject.total} classes</p>
                    </div>
                )
            })}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-full mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium">Physics Lab Report</p>
                    <p className="text-sm text-muted-foreground">Due: 25th July, 2024</p>
                    <p className="text-xs text-amber-600">3 days remaining</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-full mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium">History Essay Submission</p>
                    <p className="text-sm text-muted-foreground">Due: 28th July, 2024</p>
                    <p className="text-xs text-amber-600">6 days remaining</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-full mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground line-through">Math Assignment 3</p>
                    <p className="text-sm text-muted-foreground">Submitted on 20th July</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
