
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, Activity, FileText } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect, useCallback, useMemo } from "react";
import { studentsData as defaultStudentsData, staffData as defaultStaffData } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";

const chartConfig: ChartConfig = {
    admissions: {
      label: "New Admissions",
      color: "hsl(var(--primary))",
    },
};

interface StudentApplication {
  id: string;
  name: string;
  status: 'Pending';
}
interface TeacherApplication {
  id: string;
  name: string;
  status: 'Pending';
}

type ActivityLogItem = {
    type: 'NEW_STUDENT' | 'NEW_TEACHER' | 'SYSTEM_START';
    payload: {
        name: string;
    };
    timestamp: string;
}

const getActivityIcon = (type: ActivityLogItem['type']) => {
    switch (type) {
        case 'NEW_STUDENT': return <Users className="h-4 w-4" />;
        case 'NEW_TEACHER': return <Briefcase className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
    }
}

const getActivityMessage = (item: ActivityLogItem) => {
    switch (item.type) {
        case 'NEW_STUDENT': return `New student <span class="font-medium">${item.payload.name}</span> was enrolled.`;
        case 'NEW_TEACHER': return `New teacher <span class="font-medium">${item.payload.name}</span> was hired.`;
        case 'SYSTEM_START': return `System started up successfully.`;
        default: return 'An unknown activity occurred.';
    }
}

export function AdminDashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [newAdmissionsCount, setNewAdmissionsCount] = useState(0);
  const [teacherAppsCount, setTeacherAppsCount] = useState(0);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);

  const loadData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedStudents = localStorage.getItem('studentsData');
        const students = storedStudents ? JSON.parse(storedStudents) : defaultStudentsData;
        setStudentCount(students.length);

        const storedStaff = localStorage.getItem('staffData');
        const staff = storedStaff ? JSON.parse(storedStaff) : defaultStaffData;
        setStaffCount(staff.length);
        
        const storedStudentApps = localStorage.getItem('studentApplications');
        const studentApps: StudentApplication[] = storedStudentApps ? JSON.parse(storedStudentApps) : [];
        setNewAdmissionsCount(studentApps.filter(app => app.status === 'Pending').length);
        
        const storedTeacherApps = localStorage.getItem('teacherApplications');
        const teacherApps: TeacherApplication[] = storedTeacherApps ? JSON.parse(storedTeacherApps) : [];
        setTeacherAppsCount(teacherApps.filter(app => app.status === 'Pending').length);

        const storedActivityLog = localStorage.getItem('activityLog');
        const log = storedActivityLog ? JSON.parse(storedActivityLog) : [{ type: 'SYSTEM_START', payload: { name: 'System' }, timestamp: new Date().toISOString() }];
        setActivityLog(log.slice().reverse()); // Show most recent first

      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setStudentCount(defaultStudentsData.length);
      setStaffCount(defaultStaffData.length);
      setNewAdmissionsCount(0);
      setTeacherAppsCount(0);
      setActivityLog([]);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorageChange = (event: StorageEvent) => {
      if (['studentsData', 'staffData', 'studentApplications', 'teacherApplications', 'activityLog'].includes(event.key || '')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);

  const admissionsData = useMemo(() => {
    const studentAdmissions = activityLog.filter(item => item.type === 'NEW_STUDENT');
    const monthlyAdmissions: { [key: string]: number } = {};

    studentAdmissions.forEach(item => {
        const month = new Date(item.timestamp).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyAdmissions[month] = (monthlyAdmissions[month] || 0) + 1;
    });

    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    }).reverse();
    
    return last6Months.map(monthStr => ({
        month: monthStr.split(' ')[0], // just 'Jan', 'Feb' etc.
        admissions: monthlyAdmissions[monthStr] || 0
    }));

  }, [activityLog]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCount}</div>
            <p className="text-xs text-muted-foreground">Active and on leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Student Apps</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newAdmissionsCount}</div>
            <p className="text-xs text-muted-foreground">New admissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Teacher Apps</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{teacherAppsCount}</div>
            <p className="text-xs text-muted-foreground">New job applications</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Admissions Overview</CardTitle>
            <CardDescription>New student admissions over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={admissionsData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="admissions" fill="var(--color-admissions)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of recent system-wide events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {activityLog.slice(0, 5).map((item, index) => (
                     <div key={index} className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-full">
                            {getActivityIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: getActivityMessage(item) }}></p>
                             <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    