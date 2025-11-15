
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, Activity } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect, useCallback } from "react";
import { studentsData as defaultStudentsData, staffData as defaultStaffData } from "@/lib/data";

const admissionsData = [
    { month: "Jan", admissions: 186 },
    { month: "Feb", admissions: 305 },
    { month: "Mar", admissions: 237 },
    { month: "Apr", admissions: 73 },
    { month: "May", admissions: 209 },
    { month: "Jun", admissions: 214 },
];

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

export function AdminDashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [newAdmissionsCount, setNewAdmissionsCount] = useState(0);

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
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setStudentCount(defaultStudentsData.length);
      setStaffCount(defaultStaffData.length);
      setNewAdmissionsCount(0);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'studentsData' || event.key === 'staffData' || event.key === 'studentApplications') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);


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
            <CardTitle className="text-sm font-medium">New Admissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newAdmissionsCount}</div>
            <p className="text-xs text-muted-foreground">Pending applications</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Online
            </div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
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
                  <YAxis />
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
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Users className="h-4 w-4" />
                    </div>
                    <p className="text-sm">New student <span className="font-medium">Liam Smith</span> was enrolled.</p>
                    <p className="text-sm text-muted-foreground ml-auto whitespace-nowrap">5m ago</p>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Briefcase className="h-4 w-4" />
                    </div>
                    <p className="text-sm"><span className="font-medium">Dr. Reed</span> updated course materials.</p>
                    <p className="text-sm text-muted-foreground ml-auto whitespace-nowrap">1h ago</p>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                        <GraduationCap className="h-4 w-4" />
                    </div>
                    <p className="text-sm">Financial report for May was generated.</p>
                    <p className="text-sm text-muted-foreground ml-auto whitespace-nowrap">3h ago</p>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Users className="h-4 w-4" />
                    </div>
                    <p className="text-sm">New student <span className="font-medium">Olivia Brown</span> was enrolled.</p>
                    <p className="text-sm text-muted-foreground ml-auto whitespace-nowrap">1d ago</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
